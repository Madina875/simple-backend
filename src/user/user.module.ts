import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserService } from "./user.service";
import { JwtModule, JwtService } from "@nestjs/jwt";

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
