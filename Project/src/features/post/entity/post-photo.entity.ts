import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { Post } from "./post.entity";

@Entity("post_photos")
export class PostPhoto {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    postId!: number;

    @Column({ type: "varchar", length: 256 })
    url!: string;

    @Column({ type: "timestamp" })
    createdAt!: string;

    @ManyToOne(() => Post, post => post.postPhotos)
    post!: Post;
}