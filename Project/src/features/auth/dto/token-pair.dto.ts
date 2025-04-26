import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TokenPairDto {
    @ApiProperty({ example: "<KEY>" })
    @IsNotEmpty()
    accessToken!: string;

    @ApiProperty({ example: "<KEY>" })
    @IsNotEmpty()
    refreshToken!: string;
}