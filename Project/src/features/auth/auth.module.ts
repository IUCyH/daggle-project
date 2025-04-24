import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { USER_SERVICE } from "../user/interface/user-service.interface";
import { UserService } from "../user/user.service";
import { HashHelperService } from "../../common/helpers/hash-helper.service";
import { User } from "../user/entity/user.entity";
import { TokenInfo } from "../../common/auth/tokenVerification/entity/token-info.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, TokenInfo])
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: USER_SERVICE,
            useClass: UserService
        },
        HashHelperService
    ]
})
export class AuthModule {}