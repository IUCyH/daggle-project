import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

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
}