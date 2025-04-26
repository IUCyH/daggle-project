import { IsOptional, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {

    @ApiProperty({ example: "제목" })
    @IsOptional()
    @IsNotEmpty()
    title?: string;

    @ApiProperty({ example: "내용" })
    @IsOptional()
    @IsNotEmpty()
    content?: string;
}