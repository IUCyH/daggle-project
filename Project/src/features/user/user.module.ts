import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { USER_SERVICE } from "./interface/user-service.interface";
import { UserService } from "./user.service";
import { HashHelperService } from "../../common/helpers/hash-helper.service";
import { User } from "./entity/user.entity";
import { TokenInfo } from "../../common/auth/tokenVerification/entity/token-info.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, TokenInfo])
    ],
    controllers: [UserController],
    providers: [
        {
            provide: USER_SERVICE,
            useClass: UserService
        },
        HashHelperService
    ],
    exports: []
})
export class UserModule {}