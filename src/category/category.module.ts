import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule, JwtService } from "@nestjs/jwt";

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
