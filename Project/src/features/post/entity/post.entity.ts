import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { PostDto } from "../dto/post.dto";

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

    @Column({ type: "int" })
    likeCount!: number;

    @Column({ type: "int" })
    commentCount!: number;

    @Column({ type: "int" })
    watchCount!: number;

    @Column({ type: "timestamp" })
    createdAt!: string;

    @ManyToOne(() => User, user => user.posts)
    user!: User;

    toDto(): PostDto {
        const post = new PostDto();
        post.user = { id: this.user.id ?? 0, nickname: this.user.nickname ?? "삭제된 사용자" };
        post.title = this.title;
        post.content = this.content;
        post.likeCount = this.likeCount;
        post.commentCount = this.commentCount;
        post.watchCount = this.watchCount;
        post.createdAt = this.createdAt;
        return post;
    }
}