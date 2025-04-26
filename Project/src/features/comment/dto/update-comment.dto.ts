import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCommentDto {

    @ApiProperty({ example: "내용" })
    @IsNotEmpty()
    content!: string;
}