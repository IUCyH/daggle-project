import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenInfo } from "./tokenVerification/entity/token-info.entity";
import { TokenVerificationService } from "./tokenVerification/token-verfication.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtGuard } from "./guards/jwt.guard";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_KEY,
                signOptions: { expiresIn: "1h" }
            })
        }),
        TypeOrmModule.forFeature([TokenInfo])
    ],
    controllers: [],
    providers: [
        TokenVerificationService,
        JwtStrategy,
        JwtGuard
    ],
    exports: [
        TokenVerificationService,
        JwtStrategy,
        JwtGuard
    ]
})
export class AuthCommonModule {}