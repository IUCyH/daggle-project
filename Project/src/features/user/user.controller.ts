import {
    Controller,
    Inject,
    Get,
    Post,
    Put,
    Delete,
    Body
} from "@nestjs/common";
import { USER_SERVICE, IUserService } from "./interface/user-service.interface";
import { UserInfo } from "../../common/types/user-info.type";

import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

// TODO: guard 구현 및 유저 정보 파싱 decorator 구현
@Controller("users")
export class UserController {

    constructor(
        @Inject(USER_SERVICE)
        private readonly userService: IUserService
    ) {}

    @Get("me")
    async getMyUser(user: UserInfo) {
        return await this.userService.getMyUserById(user.id);
    }

    @Get(":id")
    async getUser(user: UserInfo) {
        return await this.userService.getUserById(user.id);
    }

    @Post()
    async createUser(@Body() body: CreateUserDto) {
        const id = await this.userService.createUser(body);
        return { id: id };
    }

    @Put("me")
    async updateUser(user: UserInfo, @Body() body: UpdateUserDto) {
        await this.userService.updateUser(user.id, body);
        return new RequestSuccessDto();
    }

    @Delete("me")
    async deleteUser(user: UserInfo) {
        await this.userService.deleteUser(user.id);
        return new RequestSuccessDto();
    }
}