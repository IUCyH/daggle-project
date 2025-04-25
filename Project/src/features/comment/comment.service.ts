import { Injectable } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Brackets, Repository, IsNull, DataSource } from "typeorm";
import { Comment } from "./entity/comment.entity";
import { Post } from "../post/entity/post.entity";
import { ICommentService } from "./interface/comment-service.interface";
import { UserCommonService } from "../../common/service/user/user-common.service";
import { CommentDto } from "./dto/comment.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

@Injectable()
export class CommentService implements ICommentService {

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly userCommonService: UserCommonService
    ) {}

    async checkIsAuthor(commentId: number, userId: number): Promise<boolean> {
        return await this.commentRepository.exists({ where: { id: commentId, userId: userId } });
    }

    async getComments(postId: number): Promise<CommentDto[]> {
        const comments = await this.commentRepository
            .createQueryBuilder("comment")
            .select([
                "comment.id",
                "comment.content",
                "comment.createdAt"
            ])
            .leftJoin("comment.user", "user")
            .addSelect(["user.id", "user.nickname"])
            .leftJoin("comment.replies", "reply", "reply.deletedAt IS NULL")
            .addSelect(["reply.id", "reply.content", "reply.createdAt"])
            .leftJoin("reply.user", "replyUser")
            .addSelect(["replyUser.id", "replyUser.nickname"])
            .where("comment.postId = :postId", { postId: postId })
            .andWhere("comment.parentId IS NULL")
            .andWhere(
                new Brackets(qb => {
                    qb.where("comment.deletedAt IS NULL")
                        .orWhere("reply.id IS NOT NULL");
                })
            )
            .orderBy("comment.createdAt", "ASC")
            .addOrderBy("reply.createdAt", "ASC")
            .getMany();
        if(!comments || comments.length === 0) {
            throw new NotFoundException("Comment not found");
        }

        return comments.map(comment => comment.toDto());
    }

    async createComment(userId: number, comment: CreateCommentDto): Promise<number> {
        const userExists = await this.userCommonService.checkUserIdExists(userId);
        if(!userExists) {
            throw new NotFoundException("User not found");
        }
        const postExists = await this.postRepository.exists({ where: { id: comment.postId } });
        if(!postExists) {
            throw new NotFoundException("Post not found");
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager
                .createQueryBuilder()
                .update(Post)
                .set({ commentCount: () => "\"comment_count\" + 1" })
                .where("id = :id", { id: comment.postId })
                .execute();
            const result = await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(Comment)
                .values({
                    postId: comment.postId,
                    userId: userId,
                    content: comment.content
                })
                .returning("id")
                .execute();

            await queryRunner.commitTransaction();
            return result.identifiers[0].id;
        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createReply(userId: number, commentId: number, reply: CreateCommentDto): Promise<number> {
        const userExists = await this.userCommonService.checkUserIdExists(userId);
        if(!userExists) {
            throw new NotFoundException("User not found");
        }
        const commentExists = await this.commentRepository.exists({
            where: { id: commentId, parentId: IsNull() },
        }); // 답글의 depth를 1로 고정(루트 댓글에만 답글을 달 수 있음, 순환 참조 및 부수효과 방지)
        if(!commentExists) {
            throw new NotFoundException("Comment not found or not a root comment");
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager
                .createQueryBuilder()
                .update(Post)
                .set({ commentCount: () => "\"comment_count\" + 1" })
                .where("id = :id", { id: reply.postId })
                .execute();
            const result = await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(Comment)
                .values({
                    postId: reply.postId,
                    userId: userId,
                    content: reply.content,
                    parentId: commentId
                })
                .returning("id")
                .execute();

            await queryRunner.commitTransaction();
            return result.identifiers[0].id;
        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateComment(commentId: number, comment: UpdateCommentDto): Promise<void> {
        await this.commentRepository
            .createQueryBuilder()
            .update()
            .set({
                content: comment.content
            })
            .where("id = :id", { id: commentId })
            .execute();
    }

    async deleteComment(commentId: number): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const post = await queryRunner.manager
                .createQueryBuilder(Comment, "comment")
                .select()
                .leftJoin("comment.post", "post")
                .addSelect("post.id")
                .where("comment.id = :id", { id: commentId })
                .getOne();
            if(!post) {
                throw new NotFoundException("Post not found");
            }

            await queryRunner.manager
                .createQueryBuilder()
                .update(Post)
                .set({ commentCount: () => `
                    CASE
                       WHEN "comment_count" > 0 THEN "comment_count" - 1
                       ELSE "comment_count"
                    END 
                `
                })
                .where("id = :id", { id: post.id })
                .execute();

            await queryRunner.manager
                .update(
                    Comment,
                    { id: commentId },
                    { deletedAt: new Date().toISOString(), content: "삭제된 댓글" }
                );
            await queryRunner.commitTransaction();
        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}