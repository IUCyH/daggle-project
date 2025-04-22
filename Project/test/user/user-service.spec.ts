import { IUserService } from "../../src/features/user/interface/user-service.interface";
import { CreateUserDto } from "../../src/features/user/dto/create-user.dto";
import { UpdateUserDto } from "../../src/features/user/dto/update-user.dto";

describe("UserService", () => {
    let userService!: IUserService;

    beforeAll(() => {
        // TODO: 구체 클래스 추가되면 userService 초기화 로직 추가
    });

    it("유저 생성 후 같은 id로 찾은 유저의 이메일은 동일해야 함", async () => {
        // given
        const user = createTestUser();
        const userId = await userService.createUser(user);

        // when
        const foundUser = await userService.getUserById(userId);

        // then
        expect(foundUser.email).toEqual(user.email);
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