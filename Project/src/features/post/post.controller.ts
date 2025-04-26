import path from "path";
import { v4 as uuid } from "uuid";
import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
    ParseIntPipe,
    BadRequestException,
    ForbiddenException
} from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { SwaggerCommonErrorResponse } from "../../common/decorators/swagger-common-error-responses.decorator";
import { AuthorCheckInterceptor } from "../../common/interceptor/author-check.interceptor";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { diskStorage } from "multer";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserInfo } from "../../common/types/user-info.type";

import { POST_SERVICE, IPostService } from "./interface/post-service.interface";
import { COMMENT_SERVICE, ICommentService } from "../comment/interface/comment-service.interface";

import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { RequestFailedDto } from "../../common/dto/request-failed.dto";
import { GetPostDto } from "./dto/get-post.dto";
import { SearchPostDto } from "./dto/search-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostDto } from "./dto/post.dto";
import { PostDetailDto } from "./dto/post-detail.dto";
import { CommentDto } from "../comment/dto/comment.dto";
import { ToggleLikeDto } from "./dto/toggle-like.dto";
import { FileDto } from "./dto/file.dto";
import { PhotoDto } from "./dto/photo.dto";
import { FileHelperService } from "../../common/helpers/file-helper.service";
import { AllFiledUndefinedTestPipe } from "../../common/pipes/all-filed-undefined-test.pipe";

@Controller("posts")
export class PostController {

    constructor(
        @Inject(POST_SERVICE)
        private readonly postService: IPostService,
        @Inject(COMMENT_SERVICE)
        private readonly commentService: ICommentService
    ) {}

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get()
    @ApiOperation({ summary: "게시물을 가져옵니다. 첫 요청은 date에 0을 넣고, 그 후 부터는 게시물 목록의 마지막 게시물의 날짜를 넣습니다. order는 recent, popular 두가지 문자를 넣을 수 있으며, 비어있으면 기본값으로 recent가 들어갑니다." })
    @ApiResponse({ status: 200, description: "가져올 게시물이 존재합니다.", type: [PostDto] })
    @ApiResponse({ status: 404, description: "가져올 게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async getPosts(@Query() query: GetPostDto) {
        if(query.date === "0") {
            query.date = "9999-12-31 23:59:59";
        }
        return await this.postService.getPosts(query);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get("search")
    @ApiOperation({ summary: "주어진 키워드에 해당하는 게시물을 가져옵니다. 첫 요청은 date에 0을 넣고, 그 후 부터는 date에 게시물 목록의 마지막 게시물의 날짜를 넣습니다. order는 recent, popular 두가지 문자를 넣을 수 있으며, 비어있으면 기본값으로 recent가 들어갑니다. option에는 title, content, nickname 을 넣을 수 있으며, 기본값으로는 title이 들어갑니다." })
    @ApiResponse({ status: 200, description: "가져올 게시물이 존재합니다.", type: [PostDto] })
    @ApiResponse({ status: 404, description: "가져올 게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async searchPosts(@Query() query: SearchPostDto) {
        if(query.date === "0") {
            query.date = "9999-12-31 23:59:59";
        }
        return await this.postService.searchPosts(query);
    }

    @Get(":id/detail")
    @ApiOperation({ summary: "id에 해당하는 게시물의 세부 정보(파일 url, 게시물 url)을 가져옵니다."})
    @ApiResponse({ status: 200, description: "id에 해당하는 게시물이 존재합니다.", type: PostDetailDto })
    @ApiResponse({ status: 404, description: "id에 해당하는 게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async getPostDetail(@Param("id", ParseIntPipe) id: number) {
        return await this.postService.getPostDetail(id);
    }

    @Get(":id/comments")
    @ApiOperation({ summary: "id에 해당하는 게시물의 댓글 목록을 가져옵니다."})
    @ApiResponse({ status: 200, description: "id에 해당하는 게시물이 존재하고, 댓글이 하나라도 존재합니다.", type: [CommentDto] })
    @ApiResponse({ status: 404, description: "id에 해당하는 게시물이 존재하지 않거나 댓글이 하나도 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async getComments(@Param("id", ParseIntPipe) id: number) {
        return await this.commentService.getComments(id);
    }

    @Post(":id/watch-count")
    @ApiOperation({ summary: "id에 해당하는 게시물의 조회수를 증가시킵니다."})
    @ApiResponse({ status: 201, description: "id에 해당하는 게시물이 존재하고, 조회수 증가에 성공했습니다.", type: RequestSuccessDto })
    @ApiResponse({ status: 404, description: "id에 해당하는 게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async increaseWatchCount(@Param("id", ParseIntPipe) id: number) {
        await this.postService.increaseWatchCount(id);
        return new RequestSuccessDto();
    }

    @UseGuards(JwtGuard)
    @Post(":id/like-count")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "id에 해당하는 게시물의 좋아요를 토글합니다."})
    @ApiResponse({ status: 201, description: "id에 해당하는 게시물이 존재하고, 좋아요 토글이 성공하였습니다.", type: ToggleLikeDto })
    @ApiResponse({ status: 404, description: "id에 해당하는 게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async toggleLikeCount(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) id: number) {
        return await this.postService.toggleLikeCount(id, user.id);
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(
        AuthorCheckInterceptor,
        FilesInterceptor("file", 5, {
            storage: diskStorage({
                destination: (req, res, callback) => {
                    const { id } = req.params;
                    const uploadPath = path.join(process.cwd(), "uploads", "posts", id.toString(), "files");

                    if(!req.uploadStarted) {
                        FileHelperService.cleanFiles(uploadPath);
                        req.uploadStarted = true;
                    }

                    callback(null, uploadPath);
                },
                filename: (req, file, callback) => {
                    const ext = path.extname(file.originalname);
                    const fileName = `${ uuid().replace(/-/g, "") }${ext}`;
                    callback(null, fileName);
                }
            }),
            limits: { fileSize: 500 * 1024 * 1024 } // 500MB
        })
    )
    @Post(":id/files")
    @ApiSecurity("bearer")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                "file": {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary"
                    }
                }
            }
        }
    })
    @ApiOperation({ summary: "특정 게시물에 파일을 업로드 합니다. 최대 5개까지 동시에 업로드 가능합니다."})
    @ApiResponse({ status: 201, description: "업로드에 성공하였습니다.", type: [FileDto] })
    @ApiResponse({ status: 400, description: "업로드할 파일이 없습니다.", type: RequestFailedDto })
    @ApiResponse({ status: 403, description: "작성자가 아닙니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async uploadFiles(@Param("id", ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
        if(!files || files.length === 0) {
            throw new BadRequestException("No files uploaded");
        }

        const fileMetas = files.map(file => new FileDto(
            file.originalname,
            `${process.env.UPLOAD_PATH}/posts/${ id }/files/${ file.filename }`
        ));
        await this.postService.updateFileLink(id, fileMetas);
        return fileMetas;
    }

    @UseGuards(JwtGuard)
    @UseInterceptors(
        AuthorCheckInterceptor,
        FilesInterceptor("photo", 20, {
            storage: diskStorage({
                destination: (req, res, callback) => {
                    const { id } = req.params;
                    const uploadPath = path.join(process.cwd(), "uploads", "posts", id.toString(), "photos");

                    if(!req.uploadStarted) {
                        FileHelperService.cleanFiles(uploadPath);
                        req.uploadStarted = true;
                    }

                    callback(null, uploadPath);
                },
                filename: (req, file, callback) => {
                    const ext = path.extname(file.originalname);
                    const fileName = `${ uuid().replace(/-/g, "") }${ext}`;
                    callback(null, fileName);
                }
            }),
            limits: { fileSize: 5 * 1024 * 1024 } // 5MB
        })
    )
    @Post(":id/photos")
    @ApiSecurity("bearer")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                "photo": {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary"
                    }
                }
            }
        }
    })
    @ApiOperation({ summary: "특정 게시물에 사진을 업로드 합니다. 최대 20개까지 동시에 업로드 가능합니다."})
    @ApiResponse({ status: 201, description: "업로드에 성공하였습니다.", type: [PhotoDto] })
    @ApiResponse({ status: 400, description: "업로드할 사진이 없습니다.", type: RequestFailedDto })
    @ApiResponse({ status: 403, description: "작성자가 아닙니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async uploadPhotos(@Param("id", ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
        if(!files || files.length === 0) {
            throw new BadRequestException("No files uploaded");
        }

        const photoMetas = files.map(file => new PhotoDto(
            `${process.env.UPLOAD_PATH}/posts/${ id }/photos/${ file.filename }`
        ));
        await this.postService.updatePhotoLink(id, photoMetas);
        return photoMetas;
    }

    @UseGuards(JwtGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "게시물을 등록합니다." })
    @ApiResponse({ status: 201, description: "게시물 등록이 성공하였습니다. 게시물의 id를 반환합니다." })
    @ApiResponse({ status: 404, description: "유저가 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async createPost(@CurrentUser() user: UserInfo, @Body() body: CreatePostDto) {
        const id = await this.postService.createPost(user.id, body);
        return { id: id };
    }

    @UsePipes(
        new AllFiledUndefinedTestPipe(),
        new ValidationPipe({ transform: true })
    )
    @UseGuards(JwtGuard)
    @Patch(":id")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "게시물을 업데이트 합니다." })
    @ApiResponse({ status: 200, description: "게시물 업데이트에 성공하였습니다.", type: RequestSuccessDto })
    @ApiResponse({ status: 403, description: "유저가 존재하지 않거나 작성자가 아닙니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async updatePost(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) id: number, @Body() body: UpdatePostDto) {
        const isAuthor = await this.postService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.postService.updatePost(id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(JwtGuard)
    @Delete(":id")
    @ApiSecurity("bearer")
    @ApiOperation({ summary: "게시물을 삭제합니다." })
    @ApiResponse({ status: 200, description: "게시물 삭제에 성공하였습니다.", type: RequestSuccessDto })
    @ApiResponse({ status: 403, description: "유저가 존재하지 않거나 작성자가 아닙니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "게시물이 존재하지 않습니다.", type: RequestFailedDto })
    @SwaggerCommonErrorResponse()
    async deletePost(@CurrentUser() user: UserInfo, @Param("id", ParseIntPipe) id: number) {
        const isAuthor = await this.postService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.postService.deletePost(id);
        return new RequestSuccessDto();
    }
}