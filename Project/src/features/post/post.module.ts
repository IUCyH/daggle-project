import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entity/post.entity";
import { Comment } from "../comment/entity/comment.entity";
import { PostController } from "./post.controller";
import { POST_SERVICE } from "./interface/post-service.interface";
import { PostService } from "./post.service";
import { COMMENT_SERVICE } from "../comment/interface/comment-service.interface";
import { CommentService } from "../comment/comment.service";
import { AuthorCheckInterceptor } from "../../common/interceptor/author-check.interceptor";

@Module({
    imports: [
        TypeOrmModule.forFeature([Post]),
        TypeOrmModule.forFeature([Comment])
    ],
    controllers: [PostController],
    providers: [
        {
            provide: POST_SERVICE,
            useClass: PostService
        },
        {
            provide: COMMENT_SERVICE,
            useClass: CommentService
        },
        AuthorCheckInterceptor
    ],
    exports: []
})
export class PostModule {}