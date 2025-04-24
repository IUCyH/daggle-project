import {
    Controller,
    Inject,
    Post,
    Body,
    UseGuards,
    UsePipes
} from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { SigninDto } from "./dto/signin.dto";
import { TokenPairDto } from "./dto/token-pair.dto";
import { UserInfo } from "../../common/types/user-info.type";
import { AUTH_SERVICE, IAuthService } from "./interface/auth-service.interface";
import { TokenVerificationService } from "../../common/auth/tokenVerification/token-verfication.service";

@Controller("auth")
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
        private readonly tokenVerificationService: TokenVerificationService
    ) {}

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("signin")
    async signin(@Body() body: SigninDto) {
        const id = await this.authService.getUserIdByEmailAndPassword(body.email, body.password);
        return await this.authService.generateAndSaveTokenPair(id);
    }

    @UseGuards(JwtGuard)
    @Post("signout")
    async signout(@CurrentUser() user: UserInfo) {
        await this.authService.invalidateTokenPair(user.id);
        return new RequestSuccessDto();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("refresh")
    async refresh(@Body() body: TokenPairDto) {
        const userId = await this.tokenVerificationService.verifyRefreshToken(body.accessToken, body.refreshToken);
        return await this.authService.generateAndSaveTokenPair(userId);
    }
}