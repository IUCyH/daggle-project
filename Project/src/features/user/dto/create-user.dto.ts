import {
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsString
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {

    @ApiProperty({ example: "abc@abc.com" })
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "비밀번호" })
    @IsNotEmpty()
    @IsString()
    password!: string;

    @ApiProperty({ example: "이름" })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: "닉네임" })
    @IsOptional()
    @IsString()
    nickname?: string;
}