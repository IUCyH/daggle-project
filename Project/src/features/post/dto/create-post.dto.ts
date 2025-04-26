import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {

    @ApiProperty({ example: "제목" })
    @IsNotEmpty()
    title!: string;

    @ApiProperty({ example: "내용" })
    @IsNotEmpty()
    content!: string;
}