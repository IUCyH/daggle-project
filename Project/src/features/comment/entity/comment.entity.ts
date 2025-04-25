import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany
} from "typeorm";
import { User } from "../../user/entity/user.entity";
import { Post } from "../../post/entity/post.entity";
import { CommentDto } from "../dto/comment.dto";

@Entity("comments")
export class Comment {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    postId!: number;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "int", nullable: true })
    parentId!: number | null;

    @Column({ type: "varchar", length: 64 })
    content!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: string;

    @Column({ type: "timestamp", nullable: true })
    deletedAt!: string | null;

    @ManyToOne(() => User, user => user.comments)
    user!: User;

    @ManyToOne(() => Post, post => post.comments)
    post!: Post;

    @ManyToOne(() => Comment, comment => comment.replies)
    parent!: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[] = [];

    toDto(): CommentDto {
        const comment = new CommentDto();
        comment.id = this.id;
        comment.user = { id: this.user?.id ?? 0, nickname: this.user?.nickname ?? "삭제된 사용자" };
        comment.content = this.content;
        comment.createdAt = this.createdAt;
        comment.replies = this.replies.map(reply => reply.toDto());
        return comment;
    }
}