import {
    IsOptional,
    IsString
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {

    @ApiProperty({ example: "비밀번호" })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({ example: "이름" })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: "닉네임" })
    @IsOptional()
    @IsString()
    nickname?: string;
}