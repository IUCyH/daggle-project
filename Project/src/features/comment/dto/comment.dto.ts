import { UserInfo } from "../../../common/types/user-info.type";

export class CommentDto {

    id!: number;
    user!: UserInfo;
    content!: string;
    createdAt!: string;
    replies!: CommentDto[];
}