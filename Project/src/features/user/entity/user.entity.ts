import {
    Entity,
    Column,
    PrimaryGeneratedColumn
} from "typeorm";
import { UserDto } from "../dto/user.dto";

@Entity()
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

    toDto(isMe: boolean): UserDto {
        const user = new UserDto();
        user.id = this.id;
        user.email = isMe ? this.email : undefined;
        user.name = this.name;
        user.nickname = this.nickname;
        return user;
    }
}