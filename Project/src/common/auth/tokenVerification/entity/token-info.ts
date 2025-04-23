import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne
} from "typeorm";
import { User } from "../../../../features/user/entity/user.entity";

@Entity()
export class TokenInfo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    userId!: number;

    @Column({ type: "varchar", length: 32 })
    refreshToken!: string; // UUID

    @Column({ type: "varchar", length: 32 })
    accessTokenVersion!: string; // UUID

    @Column({ type: "int" })
    refreshTokenExpiresAt!: number;

    @OneToOne(() => User, user => user.tokenInfo)
    user!: User;
}