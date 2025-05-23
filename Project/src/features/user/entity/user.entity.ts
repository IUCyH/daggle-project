import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    OneToMany
} from "typeorm";
import { Post } from "../../post/entity/post.entity";
import { Comment } from "../../comment/entity/comment.entity";
import { UserDto } from "../dto/user.dto";
import { TokenInfo } from "../../../common/auth/tokenVerification/entity/token-info.entity";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 10 })
    name!: string;

    @Column({ type: "varchar", length: 15 })
    nickname!: string;

    @Column({ type: "varchar", length: 128 })
    email!: string;

    @Column({ type: "varchar", length: 128 })
    password!: string;

    @Column({ type: "timestamp", nullable: true })
    deletedAt!: string | null;

    @OneToOne(() => TokenInfo, tokenInfo => tokenInfo.user)
    tokenInfo!: TokenInfo;

    @OneToMany(() => Post, post => post.user)
    posts!: Post[];

    @OneToMany(() => Comment, comment => comment.user)
    comments!: Comment[];

    toDto(isMe: boolean): UserDto {
        const user = new UserDto();
        user.id = this.id;
        user.email = isMe ? this.email : undefined;
        user.name = this.name;
        user.nickname = this.nickname;
        return user;
    }
}