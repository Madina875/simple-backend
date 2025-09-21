import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    PrismaModule,
    UserModule,
    ProductsModule,
    CategoryModule,
    AuthModule,
  ],
  controllers: [],
  providers: [UserService],
})
export class AppModule {}
