import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { WinstonModule } from "nest-winston";
import { LogConfig } from "./configs/log.config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./common/interceptor/logging.interceptor";
import { APP_FILTER } from "@nestjs/core";
import { ExceptionLoggingFilter } from "./common/exceptionFilter/exception-logging.filter";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { AuthCommonModule } from "./common/auth/auth-common.module";
import { UserCommonModule } from "./common/service/user/user-common.module";
import { AuthModule } from "./features/auth/auth.module";
import { UserModule } from "./features/user/user.module";
import { PostModule } from "./features/post/post.module";
import { CommentModule } from "./features/comment/comment.module";
import path from "path";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            envFilePath: [".env", `.${process.env.NODE_ENV}.env`],
        }),
        ServeStaticModule.forRootAsync({
            useFactory: () => ([{
                rootPath: path.join(process.cwd(), process.env.UPLOAD_PATH ?? "static/uploads"),
                serveRoot: process.env.UPLOAD_PATH
            }])
        }),
        WinstonModule.forRoot(LogConfig),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: "postgres",
                host: "daggle-db",
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
        UserCommonModule,
        AuthModule,
        UserModule,
        PostModule,
        CommentModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionLoggingFilter
        }
    ],
})
export class AppModule {}
