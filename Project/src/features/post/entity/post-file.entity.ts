import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { Post } from "./post.entity";

@Entity("post_files")
export class PostFile {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    postId!: number;

    @Column({ type: "varchar", length: 128 })
    name!: string;

    @Column({ type: "varchar", length: 256 })
    url!: string;

    @Column({ type: "timestamp" })
    createdAt!: string;

    @ManyToOne(() => Post, post => post.postFiles)
    post!: Post;
}