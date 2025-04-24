import { Test } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Repository } from "typeorm";

import { AuthCommonModule } from "../../../src/common/auth/auth-common.module";
import { IAuthService } from "../../../src/features/auth/interface/auth-service.interface";
import { IUserService } from "../../../src/features/user/interface/user-service.interface";
import { CreateUserDto } from "../../../src/features/user/dto/create-user.dto";
import { User } from "../../../src/features/user/entity/user.entity";
import { UserService } from "../../../src/features/user/user.service";
import { TokenInfo } from "../../../src/common/auth/tokenVerification/entity/token-info.entity";
import { AuthService } from "../../../src/features/auth/auth.service";
import { HashHelperService } from "../../../src/common/helpers/hash-helper.service";

describe("AuthService", () => {
    let authService: IAuthService;
    let userService: IUserService;
    let userRepository: Repository<User>;
    let tokenRepository: Repository<TokenInfo>;

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
                TypeOrmModule.forFeature([TokenInfo]),
                AuthCommonModule
            ],
            providers: [
                UserService,
                AuthService,
                HashHelperService
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        tokenRepository = module.get<Repository<TokenInfo>>(getRepositoryToken(TokenInfo));
    });

    afterEach(async () => {
        await userRepository.clear();
        await tokenRepository.clear();
    });

    it("가입한 이메일, 패스워드로 토큰이 발급되야 함", async () => {
        // given
        const newUser = createTestUser();
        const id = await userService.createUser(newUser);

        // when
        const userId = await authService.getUserIdByEmailAndPassword(newUser.email, newUser.password);
        const tokenPair = await authService.generateAndSaveTokenPair(userId);

        console.log(tokenPair);
        // then
        expect(userId).toEqual(id);
        expect(tokenPair.accessToken).not.toBeNull();
        expect(tokenPair.refreshToken).not.toBeNull();
    });

    it("가입한 유저의 id에 해당하는 토큰들이 무효화 되야 함", async () => {
        // given
        const newUser = createTestUser();
        const userId = await userService.createUser(newUser);

        // when
        await authService.generateAndSaveTokenPair(userId);
        await authService.invalidateTokenPair(userId);

        // then
        const result = await tokenRepository.findOne({
            where: { userId: userId },
            select: ["refreshTokenExpiresAt"]
        });
        expect(result?.refreshTokenExpiresAt).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
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