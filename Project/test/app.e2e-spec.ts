import { Test } from "@nestjs/testing";
import { NestApplication } from "@nestjs/core";
import * as request from "supertest";
import { WinstonModule } from "nest-winston";
import { LogConfig } from "../src/configs/log.config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "../src/common/interceptor/logging.interceptor";
import { AppService } from "../src/app.service";
import { AppController } from "../src/app.controller";

describe("App Service", () => {
    let app: NestApplication;
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                WinstonModule.forRoot(LogConfig)
            ],
            controllers: [AppController],
            providers: [
                AppService,
                {
                    provide: APP_INTERCEPTOR,
                    useClass: LoggingInterceptor
                }
            ]
        }).compile();
        app = module.createNestApplication();
        await app.init();
    });

    it("log config의 level이 debug 라면 로깅이 찍혀야 함", async () => {
        const result = await request.default(app.getHttpServer()).get("/");
        expect(result.status).toEqual(200);
    });
});