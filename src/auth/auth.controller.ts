import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { SignInUserDto } from "../user/dto/signin-user.dto";
import { Response } from "express";
import { GetCurrentUserId, GetCurrrentUser } from "../common/decorators";
import { RefreshTokenGuard } from "../common/guards";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { UserService } from "../user/user.service";
import { AuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("user/signup")
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get current user info" })
  @ApiOkResponse({ description: "Returns the current user info" })
  getMe(@GetCurrentUserId() userId: number) {
    return this.userService.findOne(userId);
  }

  @Post("user/signin")
  async sigin(
    @Body() singInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signin(singInUserDto, res);
  }

  @Get("user/activate/:link")
  async activate(@Param("link") activationLink: string) {
    return this.authService.activate(activationLink);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("user/signout")
  @HttpCode(HttpStatus.OK)
  async signout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signout(userId, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("user/refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetCurrentUserId() userId: number,
    @GetCurrrentUser("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.updateRefreshToken(userId, refreshToken, res);
  }
}
