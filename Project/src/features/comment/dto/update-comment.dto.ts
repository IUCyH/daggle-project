import { IsNotEmpty, IsInt } from "class-validator";

export class UpdateCommentDto {

    @IsNotEmpty()
    @IsInt()
    id!: number;

    @IsNotEmpty()
    content!: string;
}