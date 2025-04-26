import {
    Entity,
    PrimaryColumn
} from "typeorm";

@Entity("user_likes")
export class UserLike {

    @PrimaryColumn()
    userId!: number;

    @PrimaryColumn()
    postId!: number;
}