import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";

@Module({
  imports: [JwtModule.register({}), PrismaModule, PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtModule, JwtService, UserService],
})
export class AuthModule {}
