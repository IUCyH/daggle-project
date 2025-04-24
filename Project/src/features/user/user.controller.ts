import {
    Controller,
    Inject,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    UsePipes
} from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { AllFiledUndefinedTestPipe } from "../../common/pipes/all-filed-undefined-test.pipe";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { USER_SERVICE, IUserService } from "./interface/user-service.interface";
import { UserInfo } from "../../common/types/user-info.type";

import { RequestSuccessDto } from "../../common/dto/request-success.dto";
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
    async getMyUser(@CurrentUser() user: UserInfo) {
        return await this.userService.getMyUserById(user.id);
    }

    @UseGuards(JwtGuard)
    @Get(":id")
    async getUser(@Param("id") id: number) {
        return await this.userService.getUserById(id);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    async createUser(@Body() body: CreateUserDto) {
        const id = await this.userService.createUser(body);
        return { id: id };
    }

    @UsePipes(
        new AllFiledUndefinedTestPipe(),
        new ValidationPipe({ transform: true })
    )
    @UseGuards(JwtGuard)
    @Put("me")
    async updateUser(@CurrentUser() user: UserInfo, @Body() body: UpdateUserDto) {
        await this.userService.updateUser(user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(JwtGuard)
    @Delete("me")
    async deleteUser(@CurrentUser() user: UserInfo) {
        await this.userService.deleteUser(user.id);
        return new RequestSuccessDto();
    }
}