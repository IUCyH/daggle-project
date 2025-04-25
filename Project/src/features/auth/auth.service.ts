import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { uuid } from "uuidv4";

import { User } from "../user/entity/user.entity";
import { TokenInfo } from "../../common/auth/tokenVerification/entity/token-info.entity";
import { IAuthService } from "./interface/auth-service.interface";
import { HashHelperService } from "../../common/helpers/hash-helper.service";
import { TokenPayload } from "../../common/types/token-payload.type";
import { TokenPairDto } from "./dto/token-pair.dto";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { UnauthorizedException } from "../../common/exceptions/unauthorized.exception";

@Injectable()
export class AuthService implements IAuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(TokenInfo)
        private readonly tokenInfoRepository: Repository<TokenInfo>,
        private readonly hashHelperService: HashHelperService,
        private readonly jwtService: JwtService
    ) {}

    async getUserIdByEmailAndPassword(email: string, password: string): Promise<number> {
        const user = await this.userRepository.findOne({
            where: { email: email, deletedAt: IsNull() },
            select: ["id", "password"]
        });
        if(!user) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const verified = await this.hashHelperService.verify(user.password, password);
        if(!verified) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return user.id;
    }

    async generateAndSaveTokenPair(userId: number): Promise<TokenPairDto> {
        const exists = await this.userRepository.exists({
            where: { id: userId, deletedAt: IsNull() }
        });
        if(!exists) {
            throw new NotFoundException("User not found");
        }

        const payload = this.createPayload(userId);
        const sevenDays = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: "1h"
        });
        const refreshToken = uuid().replace(/-/g, "");

        await this.tokenInfoRepository
            .createQueryBuilder()
            .insert()
            .into(TokenInfo)
            .values({
                accessTokenVersion: payload.jti,
                refreshToken: refreshToken,
                refreshTokenExpiresAt: sevenDays,
                userId: userId
            })
            .orUpdate([
                "access_token_version",
                "refresh_token",
                "refresh_token_expires_at",
            ], ["user_id"])
            .execute();
        return { accessToken: accessToken, refreshToken: refreshToken };
    }

    async invalidateTokenPair(userId: number): Promise<void> {
        const exists = await this.tokenInfoRepository.exists({
            where: { userId: userId }
        });
        if(!exists) {
            throw new NotFoundException("User token info not found");
        }

        const now = Math.floor(Date.now() / 1000);
        const jti = uuid().replace(/-/g, "");

        await this.tokenInfoRepository
            .createQueryBuilder()
            .update()
            .set({
                accessTokenVersion: jti,
                refreshTokenExpiresAt: now
            })
            .where("userId = :userId", { userId: userId })
            .execute();
    }

    private createPayload(userId: number): TokenPayload {
        const jti = uuid().replace(/-/g, "");
        return { sub: userId, jti: jti };
    }
}