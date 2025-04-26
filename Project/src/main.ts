import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const swaggerConfig = new DocumentBuilder()
        .setTitle("한다글다글 과제전형")
        .setDescription("과제전형 API 서버입니다.")
        .setVersion("1.0")
        .addSecurity("bearer", {
            type: "http",
            in: "header",
            scheme: "bearer",
            bearerFormat: "JWT"
        })
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("docs", app, document);
    await app.listen(8080);
    console.log("Application is running on: http://localhost:8080");
}
bootstrap();
