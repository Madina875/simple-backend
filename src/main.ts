import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConsoleLogger } from "@nestjs/common";
import chalk from "chalk";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      colors: true,
      prefix: "simple_backend",
    }),
  });

  const PORT = process.env.PORT;

  const config = new DocumentBuilder()
    .setTitle("simple-backend-api")
    .setDescription("welcome!") // ✅ fixed string
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

  await app.listen(PORT ?? 4000, () => {
    console.log(`
    ${chalk.magentaBright("✨ Fitness System Online! ")}
    🔗 URL: ${chalk.cyan.underline(`http://localhost:${PORT ?? 3030}`)}
    🕓 Time: ${chalk.gray(new Date().toLocaleTimeString())}
    `);
  });
}

bootstrap();
