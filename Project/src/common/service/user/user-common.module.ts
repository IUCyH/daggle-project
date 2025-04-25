import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../../features/user/entity/user.entity";
import { UserCommonService } from "./user-common.service";

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserCommonService],
    exports: [UserCommonService]
})
export class UserCommonModule {}