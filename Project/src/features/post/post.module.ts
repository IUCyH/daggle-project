import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entity/post.entity";
import { PostController } from "./post.controller";
import { POST_SERVICE } from "./interface/post-service.interface";
import { PostService } from "./post.service";
import { AuthorCheckInterceptor } from "../../common/interceptor/author-check.interceptor";

@Module({
    imports: [
        TypeOrmModule.forFeature([Post])
    ],
    controllers: [PostController],
    providers: [
        {
            provide: POST_SERVICE,
            useClass: PostService
        },
        AuthorCheckInterceptor
    ],
    exports: []
})
export class PostModule {}