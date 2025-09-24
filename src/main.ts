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
    .setDescription(`welcome!`)
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
  SwaggerModule.setup("/", app, documentFactory);

  await app.listen(PORT ?? 3030, () => {
    console.log(`
    ${chalk.magentaBright.magentaBright("✨ Fitness System Online! ")}
    🔗 URL: ${chalk.cyan.underline(`http://localhost:${PORT}`)}
    🕓 Time: ${chalk.gray(new Date().toLocaleTimeString())}
    `);
  });
}
bootstrap();
