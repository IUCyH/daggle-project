import { UserDto } from "../dto/user.dto";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

export interface IUserService {
    getMyUserById(id: number): Promise<UserDto>;
    getUserById(id: number): Promise<UserDto>;
    createUser(user: CreateUserDto): Promise<number>;
    updateUser(id: number, user: UpdateUserDto): Promise<void>;
    deleteUser(id: number): Promise<void>;
}