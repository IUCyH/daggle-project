import { Injectable } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Post } from "./entity/post.entity";
import { PostFile } from "./entity/post-file.entity";
import { PostPhoto } from "./entity/post-photo.entity";

import { UserCommonService } from "../../common/service/user/user-common.service";
import { IPostService, OrderValues } from "./interface/post-service.interface";

import { PostDto } from "./dto/post.dto";
import { GetPostDto } from "./dto/get-post.dto";
import { SearchPostDto } from "./dto/search-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { FileDto } from "./dto/file.dto";

import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { PostDetailDto } from "./dto/post-detail.dto";
import { PhotoDto } from "./dto/photo.dto";

@Injectable()
export class PostService implements IPostService {

    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
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

    async getPostDetail(id: number): Promise<PostDetailDto> {
        const post = await this.postRepository
            .createQueryBuilder("post")
            .select(["post.id"])
            .leftJoin("post.postFiles", "postFile")
            .addSelect(["postFile.name", "postFile.url"])
            .where("post.id = :id", { id: id })
            .getOne();
        if(!post) {
            throw new NotFoundException("Post not found");
        }

        return post.toDetailDto();
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

    async updateFileLink(id: number, files: FileDto[]): Promise<void> {
        const values = files.map(file => ({ postId: id, name: file.name, url: file.url }));

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(PostFile, { postId: id });
            if(values.length > 0) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(PostFile)
                    .values(values)
                    .execute();
            }

            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch(error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;
        }
    }

    async updatePhotoLink(id: number, photos: PhotoDto[]): Promise<void> {
        const values = photos.map(photo => ({ postId: id, url: photo.url }));

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(PostPhoto, { postId: id });
            if(values.length > 0) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(PostPhoto)
                    .values(values)
                    .execute();
            }

            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch(error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;
        }
    }

    async increaseWatchCount(id: number): Promise<void> {
        await this.postRepository.increment({ id: id }, "watchCount", 1);
    }

    async deletePost(id: number): Promise<void> {
        await this.postRepository.update({ id: id }, { deletedAt: new Date().toISOString() });
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