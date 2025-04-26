import { ApiProperty } from "@nestjs/swagger";

export class UserDto {

    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: "abc@abc.com" })
    email?: string;

    @ApiProperty({ example: "이름" })
    name!: string;

    @ApiProperty({ example: "닉네임" })
    nickname!: string;
}