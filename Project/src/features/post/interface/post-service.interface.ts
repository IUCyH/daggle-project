import { PostDto } from "../dto/post.dto";
import { GetPostDto } from "../dto/get-post.dto";
import { SearchPostDto } from "../dto/search-post.dto";
import { CreatePostDto } from "../dto/create-post.dto";
import { UpdatePostDto } from "../dto/update-post.dto";

export const POST_SERVICE = "postService";

export const Order = {
    RECENT: "recent",
    POPULAR: "popular",
} as const;
export type OrderValues = (typeof Order)[keyof typeof Order];

export const SearchOption = {
    TITLE: "title",
    CONTENT: "content",
    NICKNAME: "nickname",
} as const;
export type SearchOptionValues = (typeof SearchOption)[keyof typeof SearchOption];

export interface IPostService {

    checkIsAuthor(postId: number, userId: number): Promise<boolean>;
    getPosts(condition: GetPostDto): Promise<PostDto[]>;
    searchPosts(option: SearchPostDto): Promise<PostDto[]>;
    createPost(userId: number, post: CreatePostDto): Promise<number>;
    updatePost(id: number, post: UpdatePostDto): Promise<void>;
    increaseWatchCount(id: number): Promise<void>;
    deletePost(id: number): Promise<void>;
}