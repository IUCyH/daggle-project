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
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { SwaggerCommonErrorResponse } from "../../common/decorators/swagger-common-error-responses.decorator";
import { AllFiledUndefinedTestPipe } from "../../common/pipes/all-filed-undefined-test.pipe";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserInfo } from "../../common/types/user-info.type";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { COMMENT_SERVICE, ICommentService } from "./interface/comment-service.interface";
import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { RequestFailedDto } from "../../common/dto/request-failed.dto";
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
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "댓글을 생성합니다." })
    @ApiResponse({ status: 201, description: "댓글 생성에 성공하였습니다. 댓글 id를 반환합니다." })
    @ApiResponse({ status: 404, description: "유저가 존재하지 않거나 게시물이 존재하지 않습니다." })
    @SwaggerCommonErrorResponse()
    async createComment(@CurrentUser() user: UserInfo, @Body() body: CreateCommentDto) {
        const id = await this.commentService.createComment(user.id, body);
        return { id: id };
    }

    @UseGuards(JwtGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post(":id/replies")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "답글을 생성합니다. 루트 댓글에만 생성할 수 있으며, 답글에 다시 답글을 달 수 없습니다." })
    @ApiResponse({ status: 201, description: "답글 생성에 성공하였습니다. 답글 id를 반환합니다." })
    @ApiResponse({ status: 404, description: "유저가 존재하지 않거나 루트 댓글이 존재하지 않습니다." })
    @SwaggerCommonErrorResponse()
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
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "댓글이나 답글을 업데이트 합니다. 자신이 작성한 댓글, 답글만 가능합니다." })
    @ApiResponse({ status: 200, description: "업데이트에 성공하였습니다.", type: RequestSuccessDto })
    @ApiResponse({ status: 403, description: "작성자가 아닙니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "해당하는 댓글 혹은 답글이 존재하지 않습니다." })
    @SwaggerCommonErrorResponse()
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
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "댓글이나 답글을 삭제합니다. 작성자만 가능합니다." })
    @ApiResponse({ status: 200, description: "삭제에 성공하였습니다.", type: RequestSuccessDto })
    @ApiResponse({ status: 403, description: "작성자가 아닙니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "해당하는 댓글 혹은 답글이 존재하지 않습니다." })
    @SwaggerCommonErrorResponse()
    async deleteComment(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) id: number) {
        const isAuthor = await this.commentService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.commentService.deleteComment(id);
        return new RequestSuccessDto();
    }
}