import { UserInfo } from "../../../common/types/user-info.type";
import { ApiProperty } from "@nestjs/swagger";

export class PostDto {

    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: { id: 1, nickname: "" } })
    user!: UserInfo;

    @ApiProperty({ example: "제목" })
    title!: string;

    @ApiProperty({ example: "내용" })
    content!: string;

    @ApiProperty({ example: 0 })
    likeCount!: number;

    @ApiProperty({ example: 0 })
    commentCount!: number;

    @ApiProperty({ example: 0 })
    watchCount!: number;

    @ApiProperty({ example: "2021-01-01T00:00:00.000Z" })
    createdAt!: string;
}