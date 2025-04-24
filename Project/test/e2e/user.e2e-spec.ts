import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Repository } from "typeorm";
import { AuthCommonModule } from "../../src/common/auth/auth-common.module";

import { AuthController } from "../../src/features/auth/auth.controller";
import { UserController } from "../../src/features/user/user.controller";
import { User } from "../../src/features/user/entity/user.entity";
import { TokenInfo } from "../../src/common/auth/tokenVerification/entity/token-info.entity";
import { USER_SERVICE } from "../../src/features/user/interface/user-service.interface";
import { UserService } from "../../src/features/user/user.service";
import { AUTH_SERVICE } from "../../src/features/auth/interface/auth-service.interface";
import { AuthService } from "../../src/features/auth/auth.service";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { CreateUserDto } from "../../src/features/user/dto/create-user.dto";
import { SigninDto } from "../../src/features/auth/dto/signin.dto";
import { TokenPairDto } from "../../src/features/auth/dto/token-pair.dto";

// TODO: 계정 관련 요청 구현 후 JWT Guard 까지 통합 테스트 작성
describe("UserController", () => {
    let app: INestApplication;
    let userRepository: Repository<User>;
    let tokenRepository: Repository<TokenInfo>;

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
                        synchronize: true,
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
                TypeOrmModule.forFeature([TokenInfo]),
                AuthCommonModule
            ],
            controllers: [
                UserController,
                AuthController
            ],
            providers: [
                {
                    provide: USER_SERVICE,
                    useClass: UserService
                },
                {
                    provide: AUTH_SERVICE,
                    useClass: AuthService
                },
                HashHelperService
            ]
        }).compile();

        app = module.createNestApplication();
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        tokenRepository = module.get<Repository<TokenInfo>>(getRepositoryToken(TokenInfo));

        await app.init();
    });

    afterEach(async () => {
        await userRepository.clear();
        await tokenRepository.clear();
    });

    it("로그인 후 액세스, 리프레시 토큰이 잘 반환되야 함", async () => {
        // given
        const user = createTestUser();
        await request.default(app.getHttpServer()).post("/users")
            .set("Content-Type", "application/json")
            .send(user)
            .expect(201);

        // when
        const signinDto: SigninDto = { email: user.email, password: user.password };
        const signinRes = await request.default(app.getHttpServer())
            .post("/auth/signin")
            .set("Content-Type", "application/json")
            .send(signinDto)
            .expect(201);
        const tokenPair = signinRes.body;
        console.log(tokenPair);
        // then
        expect(tokenPair.accessToken).not.toBeNull();
        expect(tokenPair.refreshToken).not.toBeNull();
    });

    it("로그인 요청에서 ValidationPipe 가 작동해야 함", async () => {
        // given
        const user = createTestUser();
        await request.default(app.getHttpServer()).post("/users")
            .set("Content-Type", "application/json")
            .send(user)
            .expect(201);

        // when
        const wrongRequest = { email: user.email };

        // then
        await request.default(app.getHttpServer())
            .post("/auth/signin")
            .set("Content-Type", "application/json")
            .send(wrongRequest)
            .expect(400);
    });

    it("로그아웃 후 토큰 재사용이 안되야 함", async () => {
        // given
        const user = createTestUser();
        const signinDto = { email: user.email, password: user.password };

        await request.default(app.getHttpServer()).post("/users")
            .set("Content-Type", "application/json")
            .send(user)
            .expect(201);
        const signinRes = await request.default(app.getHttpServer())
            .post("/auth/signin")
            .set("Content-Type", "application/json")
            .send(signinDto)
            .expect(201);
        const tokenPair = signinRes.body;

        const getUserRes = await request.default(app.getHttpServer())
            .get("/users/me")
            .set("Authorization", `Bearer ${tokenPair.accessToken}`)
            .expect(200);
        const foundUser = getUserRes.body;
        console.log(foundUser);

        // when
        await request.default(app.getHttpServer())
            .post("/auth/signout")
            .set("Authorization", `Bearer ${tokenPair.accessToken}`)
            .expect(201);

        // then
        await request.default(app.getHttpServer())
            .get("/users/me")
            .set("Authorization", `Bearer ${tokenPair.accessToken}`)
            .expect(401);
    });

    it("리프레시 토큰 유효기간을 현재시간으로 한 후에 리프레시 토큰 검증을 하면 실패해야 함", async () => {
        // given
        const user = createTestUser();
        const signinDto = { email: user.email, password: user.password };
        await request.default(app.getHttpServer()).post("/users")
            .set("Content-Type", "application/json")
            .send(user)
            .expect(201);
        const signinRes = await request.default(app.getHttpServer())
            .post("/auth/signin")
            .set("Content-Type", "application/json")
            .send(signinDto)
            .expect(201);
        const tokenPair = signinRes.body;

        // when
        const refreshRequest = request.default(app.getHttpServer())
            .post("/auth/refresh")
            .set("Content-Type", "application/json")
            .send(tokenPair);

        // then
        await refreshRequest.expect(401);
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