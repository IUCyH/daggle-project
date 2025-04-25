import { UserInfo } from "../../../common/types/user-info.type";

export class PostDto {

    id!: number;
    user!: UserInfo;
    title!: string;
    content!: string;
    likeCount!: number;
    commentCount!: number;
    watchCount!: number;
    createdAt!: string;
}