import {
    Controller,
    Inject,
    Post,
    Body,
    UseGuards,
    UsePipes
} from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { SwaggerCommonErrorResponse } from "../../common/decorators/swagger-common-error-responses.decorator";
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
    @ApiOperation({ summary: "이메일, 비밀번호로 검증 후 액세스토큰과 리프레시 토큰을 발급합니다." })
    @ApiResponse({ status: 201, description: "토큰 발급에 성공하였습니다.", type: TokenPairDto })
    @SwaggerCommonErrorResponse()
    async signin(@Body() body: SigninDto) {
        const id = await this.authService.getUserIdByEmailAndPassword(body.email, body.password);
        return await this.authService.generateAndSaveTokenPair(id);
    }

    @UseGuards(JwtGuard)
    @Post("signout")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "만료되지 않은 액세스 토큰을 받아 액세스 토큰과 리프레시 토큰을 무효화 합니다." })
    @ApiResponse({ status: 201, description: "무효화에 성공하였습니다.", type: RequestSuccessDto })
    @SwaggerCommonErrorResponse()
    async signout(@CurrentUser() user: UserInfo) {
        await this.authService.invalidateTokenPair(user.id);
        return new RequestSuccessDto();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("refresh")
    @ApiOperation({ summary: "만료된 액세스 토큰과 리프레시 토큰을 받아 검증 후 새 액세스 토큰, 리프레시 토큰을 발급합니다." })
    @ApiResponse({ status: 201, description: "재발급에 성공하였습니다.", type: TokenPairDto })
    @SwaggerCommonErrorResponse()
    async refresh(@Body() body: TokenPairDto) {
        const userId = await this.tokenVerificationService.verifyRefreshToken(body.accessToken, body.refreshToken);
        return await this.authService.generateAndSaveTokenPair(userId);
    }
}