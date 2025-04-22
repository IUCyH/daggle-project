import {
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsString
} from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    nickname?: string;
}