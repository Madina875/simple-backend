import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { JwtPayload, ResponceFieldsUser, Tokens } from "../common/types";
import { CreateUserDto } from "../user/dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { SignInUserDto } from "../user/dto/signin-user.dto";
import { Response } from "express";
import * as nodemailer from "nodemailer";

async function sendOTP(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.smtp_host,
    port: +process.env.smtp_port!,
    secure: false,
    auth: {
      user: process.env.smtp_user,
      pass: process.env.smtp_password,
    },
  });
  await transporter.sendMail({
    from: `"Simple Backend Project" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🔑 Your OTP Code",
    text: `Your OTP code is: ${otp}. It expires in 2 minutes.`, // fallback for plain-text clients
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p style="font-size: 16px; color: #555;">Hello 👋,</p>
      <p style="font-size: 16px; color: #555;">
        Please use the following one-time password (OTP) to verify your account:
      </p>
      <h1 style="text-align: center; color: #2d89ef; letter-spacing: 5px;">${otp}</h1>
      <p style="font-size: 14px; color: #999; text-align: center;">
        This code will expire in <strong>2 minutes</strong>.
      </p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>
  `,
  });
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  private async generateTokens(user: User): Promise<Tokens> {
    const jwtConfigByRole = {
      client: {
        accessSecret: process.env.CLIENT_ACCESS_TOKEN_KEY,
        accessExpire: process.env.CLIENT_ACCESS_TOKEN_TIME,
        refreshSecret: process.env.CLIENT_REFRESH_TOKEN_KEY,
        refreshExpire: process.env.CLIENT_REFRESH_TOKEN_TIME,
      },
      admin: {
        accessSecret: process.env.ADMIN_ACCESS_TOKEN_KEY,
        accessExpire: process.env.ADMIN_ACCESS_TOKEN_TIME,
        refreshSecret: process.env.ADMIN_REFRESH_TOKEN_KEY,
        refreshExpire: process.env.ADMIN_REFRESH_TOKEN_TIME,
      },
      superadmin: {
        accessSecret: process.env.SUPERADMIN_ACCESS_TOKEN_KEY,
        accessExpire: process.env.SUPERADMIN_ACCESS_TOKEN_TIME,
        refreshSecret: process.env.SUPERADMIN_REFRESH_TOKEN_KEY,
        refreshExpire: process.env.SUPERADMIN_REFRESH_TOKEN_TIME,
      },
    };
    const role = user.role!;
    const jwtConfig = jwtConfigByRole[role];

    if (!jwtConfig) {
      throw new Error(`JWT config not found for role: ${role}`);
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.accessSecret,
        expiresIn: jwtConfig.accessExpire,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpire,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const { full_name, email, role, phone, password, confirm_password } =
      createUserDto;

    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas!");
    }
    const hashedPassword = await bcrypt.hash(password!, 7);

    const candidate = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (candidate) {
      throw new ConflictException("already exists");
    }

    const activation_link = uuidv4();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    const newUser = await this.prismaService.user.create({
      data: {
        full_name,
        email,
        role,
        phone,
        password: hashedPassword,
        confirm_password: hashedPassword,
        activation_link: activation_link,
        otp,
        otp_expires: otpExpires,
      },
    });

    await sendOTP(email, otp);

    return {
      message: "Ro'yhatdan o'tdingiz. Email orqali akkauntni faollashtiring.",
      userId: newUser.id,
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException("User not found");
    if (user.is_active) throw new ConflictException("Account already active");

    if (
      user.otp !== otp ||
      (user.otp_expires && user.otp_expires < new Date())
    ) {
      throw new BadRequestException("OTP is invalid or expired");
    }

    await this.prismaService.user.update({
      where: { email },
      data: { is_active: true, otp: null, otp_expires: null },
    });

    return { message: "Account verified successfully!" };
  }

  async resendOTP(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 mins again

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { otp: otp, otp_expires: otpExpires },
    });

    await sendOTP(email, otp);
    return { message: "New OTP sent" };
  }

  async signin(
    signInUserDto: SignInUserDto,
    res: Response
  ): Promise<ResponceFieldsUser> {
    const { email, password } = signInUserDto;
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException("user not exists");
    }

    const isValidpassword = await bcrypt.compare(password, user.password);

    if (!isValidpassword) {
      throw new BadRequestException("email or password incorrect");
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return {
      message: "foydalanuvchi tizimga kirdi",
      userId: user.id,
      accessToken,
    };
  }

  async activate(activationLink: string) {
    const user = await this.prismaService.user.findFirst({
      where: { activation_link: activationLink },
    });

    if (!user) throw new NotFoundException("Activation link invalid");

    if (user.is_active)
      throw new ConflictException("Account already activated");
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { is_active: true },
    });

    return { message: "Account activated!" };
  }

  async signout(userId: number, res: Response) {
    const result = await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: { hashedRefreshToken: null },
    });

    if (result.count === 0) {
      throw new ForbiddenException("Access Denied");
    }

    res.clearCookie("refreshToken");
    return true;
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponceFieldsUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new NotFoundException("User or token not found");
    }

    try {
      const jwtConfigByRole = {
        user: process.env.CLIENT_REFRESH_TOKEN_KEY,
        admin: process.env.ADMIN_REFRESH_TOKEN_KEY,
        superadmin: process.env.SUPERADMIN_REFRESH_TOKEN_KEY,
      };

      const role = user.role!;
      const secret = jwtConfigByRole[role];

      if (!secret) {
        throw new BadRequestException(`JWT config not found for role: ${role}`);
      }

      const decoded = this.jwtService.verify(refreshToken, { secret });

      if (decoded.id !== userId) {
        throw new BadRequestException("Token does not belong to this user");
      }
    } catch (error) {
      throw new BadRequestException("Invalid refresh token");
    }

    const tokens: Tokens = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 7);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return {
      message: "refreshed",
      userId: user.id,
      accessToken: tokens.accessToken,
    };
  }
}
