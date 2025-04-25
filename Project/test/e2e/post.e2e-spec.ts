import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Repository, DataSource } from "typeorm";
import { AuthCommonModule } from "../../src/common/auth/auth-common.module";
import { UserCommonModule } from "../../src/common/service/user/user-common.module";
import { User } from "../../src/features/user/entity/user.entity";
import { Post } from "../../src/features/post/entity/post.entity";
import { TokenInfo } from "../../src/common/auth/tokenVerification/entity/token-info.entity";

import { AuthorCheckInterceptor } from "../../src/common/interceptor/author-check.interceptor";
import { AuthController } from "../../src/features/auth/auth.controller";
import { UserController } from "../../src/features/user/user.controller";
import { PostController } from "../../src/features/post/post.controller";
import { AUTH_SERVICE } from "../../src/features/auth/interface/auth-service.interface";
import { AuthService } from "../../src/features/auth/auth.service";
import { USER_SERVICE } from "../../src/features/user/interface/user-service.interface";
import { UserService } from "../../src/features/user/user.service";
import { POST_SERVICE } from "../../src/features/post/interface/post-service.interface";
import { PostService } from "../../src/features/post/post.service";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { CreatePostDto } from "../../src/features/post/dto/create-post.dto";
import { GetPostDto } from "../../src/features/post/dto/get-post.dto";
import { CreateUserDto } from "../../src/features/user/dto/create-user.dto";
import { SigninDto } from "../../src/features/auth/dto/signin.dto";
import { PostDto } from "../../src/features/post/dto/post.dto";

describe("PostController", () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let postRepository: Repository<Post>;

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
                TypeOrmModule.forFeature([Post]),
                TypeOrmModule.forFeature([TokenInfo]),
                AuthCommonModule,
                UserCommonModule
            ],
            controllers: [
                AuthController,
                PostController,
                UserController
            ],
            providers: [
                AuthorCheckInterceptor,
                HashHelperService,
                {
                    provide: AUTH_SERVICE,
                    useClass: AuthService,
                },
                {
                    provide: USER_SERVICE,
                    useClass: UserService,
                },
                {
                    provide: POST_SERVICE,
                    useClass: PostService
                }
            ]
        }).compile();

        app = module.createNestApplication();
        dataSource = module.get(DataSource);
        postRepository = module.get(getRepositoryToken(Post));

        await app.init();
    });

    afterEach(async () => {
        await dataSource.query("TRUNCATE TABLE users, posts, token_infos CASCADE;");
    });

    it("게시물 등록 후 조회가 되야 함", async () => {
        // given
        const signinDto: SigninDto = { email: "abc@abc.com", password: "abc123" };
        const user = createTestUser();
        const post = createTestPost();

        await request.default(app.getHttpServer()).post("/users")
            .set("Content-Type", "application/json")
            .send(user)
            .expect(201);

        const signinRes = await request.default(app.getHttpServer()).post("/auth/signin")
            .set("Content-Type", "application/json")
            .send(signinDto)
            .expect(201);
        const tokenPair = signinRes.body;

        // when
        await request.default(app.getHttpServer()).post("/posts")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${tokenPair.accessToken}`)
            .send(post)
            .expect(201);

        // then
        const getPostDto = new GetPostDto();
        getPostDto.date = "0";
        const res = await request.default(app.getHttpServer()).get("/posts")
            .query(getPostDto)
            .expect(200);
        console.log(res.body);
    });

    it("게시물 등록 후 같은 id로 삭제하면 soft delete가 되야 함", async () => {
        // given
        const signinDto: SigninDto = { email: "abc@abc.com", password: "abc123" };
        const user = createTestUser();
        const post = createTestPost();

        await request.default(app.getHttpServer()).post("/users")
            .set("Content-Type", "application/json")
            .send(user)
            .expect(201);

        const signinRes = await request.default(app.getHttpServer()).post("/auth/signin")
            .set("Content-Type", "application/json")
            .send(signinDto)
            .expect(201);
        const tokenPair = signinRes.body;

        const postRes = await request.default(app.getHttpServer()).post("/posts")
            .set("Content-Type", "application/json")
            .set("Authorization", `Bearer ${tokenPair.accessToken}`)
            .send(post)
            .expect(201);
        const postId = postRes.body.id;

        // when
        await request.default(app.getHttpServer()).delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${tokenPair.accessToken}`)
            .expect(200);

        // then
        const deletedPost = await postRepository.findOne({
            where: { id: postId }
        });
        console.log(deletedPost);
        expect(deletedPost?.deletedAt).not.toBeNull();
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

function createTestPost() {
    const post = new CreatePostDto();
    post.title = "test title";
    post.content = "test content";
    return post;
}