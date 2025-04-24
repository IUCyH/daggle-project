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

    getPosts(condition: GetPostDto): Promise<PostDto>;
    searchPosts(option: SearchPostDto): Promise<PostDto>;
    createPost(post: CreatePostDto): Promise<number>;
    updatePost(post: UpdatePostDto): Promise<void>;
    deletePost(id: number): Promise<void>;
}