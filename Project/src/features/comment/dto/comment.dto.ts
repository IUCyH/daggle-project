import { UserInfo } from "../../../common/types/user-info.type";
import { ApiProperty } from "@nestjs/swagger";

export class CommentDto {

    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: { id: 1, nickname: "" } })
    user!: UserInfo;

    @ApiProperty({ example: "내용" })
    content!: string;

    @ApiProperty({ example: "2021-01-01T00:00:00.000Z" })
    createdAt!: string;

    @ApiProperty({ example: [] })
    replies!: CommentDto[];
}