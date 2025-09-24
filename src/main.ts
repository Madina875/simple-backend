import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConsoleLogger } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ExpressAdapter } from "@nestjs/platform-express";
import * as express from "express";

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: new ConsoleLogger({
      colors: true,
      prefix: "simple_backend",
    }),
  });

  const config = new DocumentBuilder()
    .setTitle("simple-backend-api")
    .setDescription("welcome!")
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "access-token"
    )
    .build();

  app.use(cookieParser());

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/docs", app, documentFactory);

  await app.init(); // ✅ IMPORTANT for Vercel (no listen!)
}

bootstrap();

// ✅ Export server for Vercel
export default server;
