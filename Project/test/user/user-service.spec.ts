import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import mockUserRepository from "./mock-user.repository";

import { IUserService } from "../../src/features/user/interface/user-service.interface";
import { CreateUserDto } from "../../src/features/user/dto/create-user.dto";
import { UpdateUserDto } from "../../src/features/user/dto/update-user.dto";
import { UserService } from "../../src/features/user/user.service";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { User } from "../../src/features/user/entity/user.entity";

import { NotFoundException } from "../../src/common/exceptions/not-found.exception";
import { BadRequestException } from "../../src/common/exceptions/bad-request.exception";

describe("UserService", () => {
    let userService!: IUserService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                HashHelperService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                }
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
    });

    it("유저 생성 후 같은 id로 찾은 유저의 이메일은 동일해야 함", async () => {
        // given
        const user = createTestUser();
        const userId = await userService.createUser(user);

        // when
        const foundUser = await userService.getMyUserById(userId);

        // then
        expect(foundUser.email).toEqual(user.email);
    });

    it("이미 생성된 유저이고, deletedAt이 null 이라면 에러가 반환되야 함", async () => {
        // given
        const user = createTestUser();

        // when
        await userService.createUser(user);

        // then
        await expect(userService.createUser(user)).rejects.toThrow(BadRequestException);
    });

    // TODO: 실제 DB 연결 후 아래 테스트 코드 실행
    it("유저 업데이트 후 변경사항이 잘 반영되야 함", async () => {
        // given
        const user = createTestUser();
        const userId = await userService.createUser(user);
        const foundUser = await userService.getUserById(userId);

        const updateUserDto = new UpdateUserDto();
        updateUserDto.name = foundUser.name;
        updateUserDto.nickname = foundUser.nickname;
        updateUserDto.password = user.password;

        // when
        updateUserDto.nickname = "updated_nickname";
        await userService.updateUser(userId, updateUserDto);

        // then
        const updatedUser = await userService.getUserById(userId);
        expect(updatedUser.nickname).not.toEqual(foundUser.nickname);
        expect(updatedUser.name).toEqual(foundUser.name);
    });

    it("유저가 잘 삭제되어야 함", async () => {
        // given
        const user = createTestUser();
        const userId = await userService.createUser(user);

        // when
        await userService.deleteUser(userId);

        // then
        expect(await userService.getUserById(userId)).toThrow(); // TODO: 서비스 에러 정의 후 채워넣기
    });
});

function createTestUser() {
    const user = new CreateUserDto();
    user.email = "abc@abc.com";
    user.password = "abc123";
    user.name = "lucy";
    user.nickname = "lucy_nickname";
    return user;
}