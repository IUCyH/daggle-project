import { Test } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { UserCommonModule } from "../../../src/common/service/user/user-common.module";
import { CommentService } from "../../../src/features/comment/comment.service";
import { Comment } from "../../../src/features/comment/entity/comment.entity";
import { Post } from "../../../src/features/post/entity/post.entity";
import { CreateCommentDto } from "../../../src/features/comment/dto/create-comment.dto";

describe("CommentService", () => {

    let commentService: CommentService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    useFactory: () => ({
                        type: "postgres",
                        host: "localhost",
                        port: 5432,
                        username: "test",
                        password: "abc123",
                        database: "test",
                        synchronize: true,
                        logging: true,
                        namingStrategy: new SnakeNamingStrategy(),
                        extra: {
                            timezone: "Z",
                            dateStrings: true
                        },
                        entities: [__dirname + "/../../../src/**/*.entity.{js,ts}"],
                        subscribers: [],
                        migrations: []
                    })
                }),
                TypeOrmModule.forFeature([Comment]),
                TypeOrmModule.forFeature([Post]),
                UserCommonModule
            ],
            providers: [
                CommentService
            ]
        }).compile();

        commentService = module.get(CommentService);
    });

    it("댓글이 등록되어야 함", async () => {
        const commentDto = new CreateCommentDto();
        commentDto.postId = 10;
        commentDto.content = "test";
        await expect(commentService.createComment(10, commentDto)).resolves.not.toThrow();
    });

    it("답글이 등록되어야 함", async () => {
        const commentDto = new CreateCommentDto();
        commentDto.postId = 10;
        commentDto.content = "test reply";

        await expect(commentService.createReply(10, 1, commentDto)).resolves.not.toThrow();
    });

    it("댓글과 답글이 나와야 하고, 중복이 없어야 함", async () => {
        const comments = await commentService.getComments(10);
        console.log(comments);
        expect(comments.length).not.toEqual(0);
    });
});