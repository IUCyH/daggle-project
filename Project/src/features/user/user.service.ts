import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { User } from "./entity/user.entity";
import { TokenInfo } from "../../common/auth/tokenVerification/entity/token-info.entity";
import { HashHelperService } from "../../common/helpers/hash-helper.service";

import { IUserService } from "./interface/user-service.interface";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { BadRequestException } from "../../common/exceptions/bad-request.exception";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";

@Injectable()
export class UserService implements IUserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(TokenInfo)
        private readonly tokenInfoRepository: Repository<TokenInfo>,
        private readonly hashHelperService: HashHelperService
    ) {}

    async getMyUserById(id: number): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: { id: id, deletedAt: IsNull() },
            select: ["id", "name", "nickname", "email"]
        });
        if(!user) {
            throw new NotFoundException("User not found");
        }

        return user.toDto(true);
    }

    async getUserById(id: number): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: { id: id, deletedAt: IsNull() },
            select: ["id", "name", "nickname"]
        });
        if(!user) {
            throw new NotFoundException("User not found");
        }

        return user.toDto(false);
    }

    async createUser(user: CreateUserDto): Promise<number> {
        const foundUser = await this.userRepository.findOne({
            where: { email: user.email }
        });

        if(!foundUser) {
            const hashedPassword = await this.hashHelperService.hash(user.password);
            const result = await this.userRepository
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    email: user.email,
                    password: hashedPassword,
                    nickname: user.nickname,
                    name: user.name
                })
                .returning("id")
                .execute();
            return result.identifiers[0].id;
        }

        if(foundUser.deletedAt == null) {
            throw new BadRequestException("User already exists");
        } else {
            return await this.recreateUser(user, foundUser);
        }
    }

    async updateUser(id: number, user: UpdateUserDto): Promise<void> {
        const exists = await this.userRepository.exists({
            where: { id: id, deletedAt: IsNull() }
        });
        if(!exists) {
            throw new NotFoundException("User not found");
        }

        const hashedPassword = user.password ? await this.hashHelperService.hash(user.password) : undefined;
        await this.userRepository
            .createQueryBuilder()
            .update()
            .set({
                password: hashedPassword,
                name: user.name,
                nickname: user.nickname
            })
            .where("id = :id", { id: id })
            .execute();
    }

    async deleteUser(id: number): Promise<void> {
        const exists = await this.userRepository.exists({
            where: { id: id, deletedAt: IsNull() }
        });
        if(!exists) {
            throw new NotFoundException("User not found");
        }

        await this.tokenInfoRepository.delete({ userId: id });
        await this.userRepository.update({ id: id }, { deletedAt: new Date().toISOString() });
    }

    private async recreateUser(newUser: CreateUserDto, originalUser: User) {
        const hashedPassword = await this.hashHelperService.hash(newUser.password);
        await this.userRepository
            .createQueryBuilder()
            .update()
            .set({
                deletedAt: null,
                password: hashedPassword,
                nickname: newUser.nickname,
                name: newUser.name
            })
            .where("id = :id", { id: originalUser.id })
            .execute();
        return originalUser.id;
    }
}