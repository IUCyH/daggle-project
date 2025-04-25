import {
    Controller,
    Inject,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    UsePipes,
    ValidationPipe,
    ParseIntPipe,
    ForbiddenException
} from "@nestjs/common";
import { AllFiledUndefinedTestPipe } from "../../common/pipes/all-filed-undefined-test.pipe";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserInfo } from "../../common/types/user-info.type";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { COMMENT_SERVICE, ICommentService } from "./interface/comment-service.interface";
import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@Controller("comments")
export class CommentController {

    constructor(
        @Inject(COMMENT_SERVICE)
        private readonly commentService: ICommentService
    ) {}

    @UseGuards(JwtGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    async createComment(@CurrentUser() user: UserInfo, @Body() body: CreateCommentDto) {
        const id = await this.commentService.createComment(user.id, body);
        return { id: id };
    }

    @UseGuards(JwtGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post(":id/replies")
    async createReply(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) commentId: number, @Body() body: CreateCommentDto) {
        const id = await this.commentService.createReply(user.id, commentId, body);
        return { id: id };
    }

    @UseGuards(JwtGuard)
    @UsePipes(
        new AllFiledUndefinedTestPipe(),
        new ValidationPipe({ transform: true })
    )
    @Patch(":id")
    async updateComment(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) id: number, @Body() body: UpdateCommentDto) {
        const isAuthor = await this.commentService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.commentService.updateComment(id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(JwtGuard)
    @Delete(":id")
    async deleteComment(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) id: number) {
        const isAuthor = await this.commentService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.commentService.deleteComment(id);
        return new RequestSuccessDto();
    }
}