import { Test } from "@nestjs/testing";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Repository } from "typeorm";
import { AuthCommonModule } from "../../src/common/auth/auth-common.module";

import { UserController } from "../../src/features/user/user.controller";
import { User } from "../../src/features/user/entity/user.entity";
import { USER_SERVICE } from "../../src/features/user/interface/user-service.interface";
import { UserService } from "../../src/features/user/user.service";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { CreateUserDto } from "../../src/features/user/dto/create-user.dto";

// TODO: 계정 관련 요청 구현 후 JWT Guard 까지 통합 테스트 작성
describe("UserController", () => {
    let userController: UserController;
    let userRepository: Repository<User>;

    beforeEach(async () => {
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
                        entities: [__dirname + "/../../src/**/*.entity.{js,ts}"],
                        subscribers: [],
                        migrations: []
                    })
                }),
                TypeOrmModule.forFeature([User]),
                AuthCommonModule
            ],
            controllers: [UserController],
            providers: [
                {
                    provide: USER_SERVICE,
                    useClass: UserService
                },
                HashHelperService
            ]
        }).compile();

        userController = module.get<UserController>(UserController);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(async () => {
        await userRepository.clear();
    });

    it("생성된 유저의 name이 같은 id로 찾은 유저와 같아야 함", async () => {
        // given
        const user = createTestUser();

        // when
        const result = await userController.createUser(user);
        const foundUser = await userController.getUser(result.id);

        // then
        expect(foundUser.name).toEqual(user.name);
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