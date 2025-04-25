import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { User } from "../../../features/user/entity/user.entity";

@Injectable()
export class UserCommonService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async checkUserIdExists(userId: number): Promise<boolean> {
        return await this.userRepository.exists({
            where: { id: userId, deletedAt: IsNull() }
        });
    }
}