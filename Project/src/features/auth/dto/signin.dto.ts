import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SigninDto {
    @ApiProperty({ example: "abc@abc.com" })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: "비밀번호" })
    @IsNotEmpty()
    password!: string;
}