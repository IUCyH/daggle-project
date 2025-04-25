import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty()
    postId!: number;

    @IsNotEmpty()
    content!: string;
}