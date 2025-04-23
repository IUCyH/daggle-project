import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { TokenPayload } from "../../types/token-payload.type";
import { TokenInfo } from "./entity/token-info";
import { UnauthorizedException } from "../../exceptions/unauthorized.exception";

@Injectable()
export class TokenVerificationService {
    constructor(
        @InjectRepository(TokenInfo)
        private readonly tokenInfoRepository: Repository<TokenInfo>,
        private readonly jwtService: JwtService
    ) {}

    /**
     * 리프레시 토큰을 검증 후 성공하면 userId, 실패하면 Unauthorized 에러를 던집니다.
     * @param accessToken
     * @param refreshToken
     */
    async verifyRefreshToken(accessToken: string, refreshToken: string) {
        const tokenInfo = await this.tokenInfoRepository.findOne({
            where: { refreshToken: refreshToken },
            select: ["refreshTokenExpiresAt", "userId", "accessTokenVersion"]
        });
        if(!tokenInfo) { // DB에 저장된 리프레시 토큰 중 인자로 받은 토큰과 동일한 토큰이 없다면(==변조되었거나 임의로 만들어진 토큰)
            throw new UnauthorizedException("Invalid token");
        }

        if(this.isRefreshTokenExpired(tokenInfo)) {
            throw new UnauthorizedException("Invalid token");
        }

        const decodedAccessToken: TokenPayload = await this.jwtService.verify(accessToken, { ignoreExpiration: true });

        if(decodedAccessToken.sub !== tokenInfo.userId) { // 액세스 토큰에서 추출한 userId와 리프레시 토큰으로 가져온 userId가 다르다면
            throw new UnauthorizedException("Invalid token");
        }

        if(decodedAccessToken.jti !== tokenInfo.accessTokenVersion) {
            throw new UnauthorizedException("Invalid token");
        }

        return tokenInfo.userId;
    }

    async verifyAccessToken(payload: TokenPayload) {
        const tokenInfo = await this.tokenInfoRepository.findOne({
            where: { userId: payload.sub },
            select: ["accessTokenVersion"]
        });
        if(!tokenInfo || payload.jti !== tokenInfo.accessTokenVersion) {
            throw new UnauthorizedException("Invalid token");
        }
    }

    private isRefreshTokenExpired(tokenInfo: TokenInfo) {
        const now = Date.now();
        return now > tokenInfo.refreshTokenExpiresAt; // 토큰의 유효기간이 지났다면
    }
}