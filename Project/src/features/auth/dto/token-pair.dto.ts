import { IsNotEmpty } from "class-validator";

export class TokenPairDto {
    @IsNotEmpty()
    accessToken!: string;

    @IsNotEmpty()
    refreshToken!: string;
}