import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentDto {

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    postId!: number;

    @ApiProperty({ example: "내용" })
    @IsNotEmpty()
    content!: string;
}