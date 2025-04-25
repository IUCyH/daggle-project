import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne
} from "typeorm";
import { User } from "../../user/entity/user.entity";
import { Comment } from "../../comment/entity/comment.entity";
import { PostFile } from "./post-file.entity";
import { PostPhoto } from "./post-photo.entity";
import { PostDto } from "../dto/post.dto";
import { PostDetailDto } from "../dto/post-detail.dto";

@Entity("posts")
export class Post {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "varchar", length: 32 })
    title!: string;

    @Column({ type: "varchar", length: 1024 })
    content!: string;

    @Column({ type: "int", default: 0 })
    likeCount!: number;

    @Column({ type: "int", default: 0 })
    commentCount!: number;

    @Column({ type: "int", default: 0 })
    watchCount!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(3)" })
    createdAt!: string;

    @Column({ type: "timestamp", nullable: true })
    deletedAt!: string | null;

    @ManyToOne(() => User, user => user.posts)
    user!: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments!: Comment[];

    @OneToMany(() => PostFile, postFile => postFile.post)
    postFiles!: PostFile[];

    @OneToMany(() => PostPhoto, postPhoto => postPhoto.post)
    postPhotos!: PostPhoto[];

    toDto(): PostDto {
        const post = new PostDto();
        post.id = this.id;
        post.user = { id: this.user?.id ?? 0, nickname: this.user?.nickname ?? "삭제된 사용자" };
        post.title = this.title;
        post.content = this.content;
        post.likeCount = this.likeCount;
        post.commentCount = this.commentCount;
        post.watchCount = this.watchCount;
        post.createdAt = this.createdAt;
        return post;
    }

    toDetailDto(): PostDetailDto {
        const post = new PostDetailDto();
        post.id = this.id;
        post.files = this.postFiles?.map(file => {
            return { name: file.name, url: file.url };
        }) ?? [];
        post.photos = this.postPhotos?.map(photo => {
            return { url: photo.url };
        }) ?? [];
        return post;
    }
}