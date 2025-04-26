import {
    Controller,
    Inject,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    UsePipes,
    ParseIntPipe
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { SwaggerCommonErrorResponse } from "../../common/decorators/swagger-common-error-responses.decorator";
import { ValidationPipe } from "@nestjs/common";
import { AllFiledUndefinedTestPipe } from "../../common/pipes/all-filed-undefined-test.pipe";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { USER_SERVICE, IUserService } from "./interface/user-service.interface";
import { UserInfo } from "../../common/types/user-info.type";

import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { RequestFailedDto } from "../../common/dto/request-failed.dto";
import { UserDto } from "./dto/user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UserController {

    constructor(
        @Inject(USER_SERVICE)
        private readonly userService: IUserService
    ) {}

    @UseGuards(JwtGuard)
    @Get("me")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "내 유저 정보를 가져옵니다." })
    @ApiResponse({ status: 200, description: "액세스 토큰에서 추출한 id에 해당하는 유저가 존재합니다.", type: UserDto })
    @ApiResponse({ status: 404, description: "액세스 토큰에서 추출한 id에 해당하는 유저가 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async getMyUser(@CurrentUser() user: UserInfo) {
        return await this.userService.getMyUserById(user.id);
    }

    @UseGuards(JwtGuard)
    @Get(":id")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "다른 유저 정보를 가져옵니다. 이메일은 제외됩니다." })
    @ApiResponse({ status: 200, description: "해당하는 id의 유저가 존재합니다.", type: UserDto })
    @ApiResponse({ status: 404, description: "해당하는 id의 유저가 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async getUser(@Param("id", ParseIntPipe) id: number) {
        return await this.userService.getUserById(id);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    @ApiOperation({ summary: "유저를 생성합니다." })
    @ApiResponse({ status: 201, description: "유저가 정상적으로 생성되었습니다. id를 반환합니다." })
    @ApiResponse({ status: 400, description: "유저가 이미 존재합니다.(이메일이 겹침)", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async createUser(@Body() body: CreateUserDto) {
        const id = await this.userService.createUser(body);
        return { id: id };
    }

    @UsePipes(
        new AllFiledUndefinedTestPipe(),
        new ValidationPipe({ transform: true })
    )
    @UseGuards(JwtGuard)
    @Patch("me")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "내 유저 정보를 업데이트 합니다." })
    @ApiResponse({ status: 200, description: "유저 업데이트가 성공하였습니다.", type: RequestSuccessDto })
    @ApiResponse({ status: 400, description: "body가 잘못되었습니다.(에러 메세지 확인)", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async updateUser(@CurrentUser() user: UserInfo, @Body() body: UpdateUserDto) {
        await this.userService.updateUser(user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(JwtGuard)
    @Delete("me")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "내 유저 정보를 삭제합니다.(soft delete)" })
    @ApiResponse({ status: 200, description: "유저 삭제에 성공하였습니다.", type: RequestSuccessDto })
    @SwaggerCommonErrorResponse()
    async deleteUser(@CurrentUser() user: UserInfo) {
        await this.userService.deleteUser(user.id);
        return new RequestSuccessDto();
    }
}