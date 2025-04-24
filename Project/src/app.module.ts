import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { WinstonModule } from "nest-winston";
import { LogConfig } from "./configs/log.config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./common/interceptor/logging.interceptor";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { AuthCommonModule } from "./common/auth/auth-common.module";
import { UserModule } from "./features/user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            envFilePath: [".env", `.${process.env.NODE_ENV}.env`],
        }),
        WinstonModule.forRoot(LogConfig),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: "postgres",
                host: "localhost",
                port: 5432,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                synchronize: false,
                logging: false,
                namingStrategy: new SnakeNamingStrategy(),
                extra: {
                    timezone: "Z",
                    dateStrings: true
                },
                entities: [__dirname + "/../**/*.entity.{js,ts}"],
                subscribers: [],
                migrations: []
            })
        }),
        AuthCommonModule,
        UserModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor
        }
    ],
})
export class AppModule {}
