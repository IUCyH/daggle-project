import { Test } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";

import { IUserService } from "../../../src/features/user/interface/user-service.interface";
import { CreateUserDto } from "../../../src/features/user/dto/create-user.dto";
import { UpdateUserDto } from "../../../src/features/user/dto/update-user.dto";
import { UserService } from "../../../src/features/user/user.service";
import { HashHelperService } from "../../../src/common/helpers/hash-helper.service";
import { TokenInfo } from "../../../src/common/auth/tokenVerification/entity/token-info.entity";
import { User } from "../../../src/features/user/entity/user.entity";

import { NotFoundException } from "../../../src/common/exceptions/not-found.exception";
import { BadRequestException } from "../../../src/common/exceptions/bad-request.exception";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Repository } from "typeorm";

describe("UserService", () => {
    let userService!: IUserService;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    useFactory: () => ({
                        type: "postgres",
                        host: "localhost",
                        port: 5432,
                        username: "test",
                        password: "abc123",
                        database: "test",
                        synchronize: false,
                        logging: true,
                        namingStrategy: new SnakeNamingStrategy(),
                        extra: {
                            timezone: "Z",
                            dateStrings: true
                        },
                        entities: [__dirname + "/../../../src/**/*.entity.{js,ts}"],
                        subscribers: [],
                        migrations: []
                    })
                }),
                TypeOrmModule.forFeature([User]),
                TypeOrmModule.forFeature([TokenInfo])
            ],
            providers: [
                UserService,
                HashHelperService
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(async () => {
        await userRepository.clear();
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

    it("이미 생성된 유저이고, deletedAt이 null 이라면 BadRequestException 에러가 반환되야 함", async () => {
        // given
        const user = createTestUser();

        // when
        await userService.createUser(user);

        // then
        await expect(userService.createUser(user)).rejects.toThrow(BadRequestException);
    });

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
        updateUserDto.nickname = "updatenickname";
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
        await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundException);
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