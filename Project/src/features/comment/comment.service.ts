import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Comment } from "./entity/comment.entity";
import { ICommentService } from "./interface/comment-service.interface";
import { UserCommonService } from "../../common/service/user/user-common.service";
import { CommentDto } from "./dto/comment.dto";
import { PostDto } from "../post/dto/post.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

@Injectable()
export class CommentService implements ICommentService {

    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(PostDto)
        private readonly postRepository: Repository<PostDto>,
        private readonly userCommonService: UserCommonService
    ) {}

    async checkIsAuthor(commentId: number, userId: number): Promise<boolean> {
        return await this.commentRepository.exists({ where: { id: commentId, userId: userId } });
    }

    async getComments(postId: number): Promise<CommentDto[]> {
        const parentComments = await this.commentRepository
            .createQueryBuilder("comment")
            .select([
                "comment.id",
                "comment.content",
                "comment.createdAt"
            ])
            .leftJoin("comment.user", "user")
            .addSelect(["user.id", "user.nickname"])
            .where("comment.postId = :postId", { postId })
            .andWhere("comment.parentId IS NULL")
            .andWhere(
                new Brackets(qb => {
                    qb.where("comment.deletedAt IS NULL")
                        .orWhere((qb: any) => {
                            return qb
                                .select(1)
                                .from(Comment, "reply")
                                .where("reply.parentId = comment.id")
                                .andWhere("reply.deletedAt IS NULL")
                                .getQuery();
                        });
                })
            )
            .orderBy("comment.createdAt", "ASC")
            .getMany();

        if(!parentComments || parentComments.length === 0) {
            throw new NotFoundException("Comment not found");
        }

        const parentCommentIds = parentComments.map(comment => comment.id);
        const replyComments = await this.commentRepository
            .createQueryBuilder("comment")
            .select([
                "comment.id",
                "comment.parentId",
                "comment.content",
                "comment.createdAt"
            ])
            .leftJoin("comment.user", "user")
            .addSelect(["user.id", "user.nickname"])
            .where("comment.parentId IN (:...parentIds)", { parentIds: parentCommentIds })
            .andWhere("comment.deletedAt IS NULL")
            .orderBy("comment.createdAt", "ASC")
            .getMany();

        return parentComments.map(parentComment => {
            parentComment.replies = replyComments.filter(reply => reply.parentId === parentComment.id);
            return parentComment.toDto();
        });
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

        const result = await this.commentRepository
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
        return result.identifiers[0].id;
    }

    async createReply(userId: number, commentId: number, reply: CreateCommentDto): Promise<number> {
        const userExists = await this.userCommonService.checkUserIdExists(userId);
        if(!userExists) {
            throw new NotFoundException("User not found");
        }
        const commentExists = await this.commentRepository.exists({ where: { id: commentId } });
        if(!commentExists) {
            throw new NotFoundException("Comment not found");
        }

        const result = await this.commentRepository
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
        return result.identifiers[0].id;
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
        await this.commentRepository
            .update({ id: commentId }, {
                deletedAt: new Date().toISOString(),
                content: "삭제된 댓글"
            });
    }
}