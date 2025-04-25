import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "./entity/post.entity";
import { UserCommonService } from "../../common/service/user/user-common.service";
import { IPostService, OrderValues } from "./interface/post-service.interface";
import { PostDto } from "./dto/post.dto";
import { GetPostDto } from "./dto/get-post.dto";
import { SearchPostDto } from "./dto/search-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";

@Injectable()
export class PostService implements IPostService {

    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly userCommonService: UserCommonService
    ) {}

    async checkIsAuthor(postId: number, userId: number): Promise<boolean> {
        return await this.postRepository.exists({ where: { id: postId, userId: userId } });
    }

    // TODO: 댓글 서비스 구현 후 쿼리 수정 및 결과 반환 로직 수정
    async getPosts(condition: GetPostDto): Promise<PostDto[]> {
        const orderCondition = this.getOrderCondition(condition.order);
        const selectQuery = this.getPostSelectQuery();

        const posts = await selectQuery
            .where("post.createdAt < :date", { date: condition.date })
            .orderBy(orderCondition.first, "DESC")
            .addOrderBy(orderCondition.second, "DESC")
            .take(50)
            .getMany();
        if(!posts || posts.length === 0) {
            throw new NotFoundException("Post not found");
        }

        return posts.map(post => post.toDto());
    }

    async searchPosts(option: SearchPostDto): Promise<PostDto[]> {
        const orderCondition = this.getOrderCondition(option.order);
        const selectQuery = this.getPostSelectQuery();

        if(option.option === "nickname") {
            selectQuery.where("user.nickname LIKE :keyword", { keyword: `%${ option.keyword }%` });
        } else {
            selectQuery.where(`post.${ option.option } LIKE :keyword`, { keyword: `%${ option.keyword }%` });
        }

        const posts = await selectQuery
            .andWhere("post.createdAt < :date", { date: option.date })
            .orderBy(orderCondition.first, "DESC")
            .addOrderBy(orderCondition.second, "DESC")
            .take(50)
            .getMany();
        if(!posts || posts.length === 0) {
            throw new NotFoundException("Post not found");
        }

        return posts.map(post => post.toDto());
    }

    async createPost(userId: number, post: CreatePostDto): Promise<number> {
        const exists = await this.userCommonService.checkUserIdExists(userId);
        if(!exists) {
            throw new NotFoundException("User not found");
        }

        const result = await this.postRepository
            .createQueryBuilder()
            .insert()
            .into(Post)
            .values({
                title: post.title,
                content: post.content,
                userId: userId
            })
            .returning("id")
            .execute();
        return result.identifiers[0].id;
    }

    async updatePost(id: number, post: UpdatePostDto): Promise<void> {
        await this.postRepository
            .createQueryBuilder()
            .update()
            .set({
                title: post.title,
                content: post.content
            })
            .where("id = :id", { id: id })
            .execute();
    }

    async deletePost(id: number): Promise<void> {
        await this.postRepository.delete({ id: id });
    }

    private getOrderCondition(order: OrderValues) {
        switch(order) {
            case "recent":
                return {
                    first: "post.createdAt",
                    second: "post.likeCount"
                };
            case "popular":
                return {
                    first: "post.likeCount",
                    second: "post.createdAt"
                };
        }
    }

    private getPostSelectQuery() {
        return this.postRepository
            .createQueryBuilder("post")
            .select([
                "post.id",
                "post.title",
                "post.content",
                "post.likeCount",
                "post.commentCount",
                "post.watchCount",
                "post.createdAt"
            ])
            .leftJoin("post.user", "user", "user.deletedAt IS NULL")
            .addSelect(["user.id", "user.nickname"]);
    }
}