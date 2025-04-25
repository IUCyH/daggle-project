import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entity/comment.entity";
import { Post } from "../post/entity/post.entity";
import { COMMENT_SERVICE } from "./interface/comment-service.interface";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, Post])
    ],
    controllers: [CommentController],
    providers: [
        {
            provide: COMMENT_SERVICE,
            useClass: CommentService
        }
    ],
    exports: []
})
export class CommentModule {}