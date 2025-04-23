import { UserDto } from "../dto/user.dto";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

export const USER_SERVICE = "userService";

export interface IUserService {
    /**
     * 이메일을 포함한 내 유저의 정보를 가져옵니다.
     * @param id
     */
    getMyUserById(id: number): Promise<UserDto>;

    /**
     * 이메일을 제외한 다른 유저의 정보를 가져옵니다.
     * @param id
     */
    getUserById(id: number): Promise<UserDto>;
    createUser(user: CreateUserDto): Promise<number>;
    updateUser(id: number, user: UpdateUserDto): Promise<void>;
    deleteUser(id: number): Promise<void>;
}