import { IAuthService } from "../../../src/features/auth/interface/auth-service.interface";
import { IUserService } from "../../../src/features/user/interface/user-service.interface";
import { CreateUserDto } from "../../../src/features/user/dto/create-user.dto";

// TODO: AuthService 완성 후 테스트 코드 완성시키기
describe("AuthService", () => {
    let authService: IAuthService;
    let userService: IUserService;

    it("가입한 이메일, 패스워드로 토큰이 발급되야 함", async () => {
        // given
        const newUser = createTestUser();
        await userService.createUser(newUser);

        // when
        const userId = await authService.getUserIdByEmailAndPassword(newUser.email, newUser.password);
        const accessToken = await authService.generateAccessToken(userId);
        const refreshToken = await authService.generateRefreshToken(userId);

        // then
        expect(accessToken).not.toBeNull();
        expect(refreshToken).not.toBeNull();
    });

    it("가입한 유저의 id에 해당하는 토큰들이 무효화 되야 함", async () => {
        // given
        const newUser = createTestUser();
        const userId = await userService.createUser(newUser);

        // when
        const accessToken = await authService.generateAccessToken(userId);
        const refreshToken = await authService.generateRefreshToken(userId);

        // then
        await authService.invalidateTokenPair(userId);
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