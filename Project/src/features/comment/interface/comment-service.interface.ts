import { CommentDto } from "../dto/comment.dto";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { UpdateCommentDto } from "../dto/update-comment.dto";

export const COMMENT_SERVICE = "CommentService";

export interface ICommentService {

    checkIsAuthor(commentId: number, userId: number): Promise<boolean>;
    getComments(postId: number): Promise<CommentDto[]>
    createComment(comment: CreateCommentDto): Promise<number>;
    createReply(commentId: number, reply: CreateCommentDto): Promise<number>;
    updateComment(commentId: number, comment: UpdateCommentDto): Promise<void>;
    deleteComment(commentId: number): Promise<void>;
}