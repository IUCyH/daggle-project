import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { TokenVerificationService } from "../tokenVerification/token-verfication.service";
import { TokenPayload } from "../../types/token-payload.type";
import { UserInfo } from "../../types/user-info.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly tokenVerificationService: TokenVerificationService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_KEY ?? "test"
        });
    }

    async validate(payload: TokenPayload): Promise<UserInfo> {
        await this.tokenVerificationService.verifyAccessToken(payload);
        return { id: payload.sub };
    }
}