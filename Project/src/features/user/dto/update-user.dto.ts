import {
    IsOptional,
    IsString
} from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    nickname?: string;
}