import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConsoleLogger } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

let cachedServer: any; // 👈 Express handler, not http.Server

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
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

  await app.init();
  return app.getHttpAdapter().getInstance(); // Express app (req, res) => ...
}

// ⚡ Vercel entry
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(req, res);
}
