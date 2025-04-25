import path from "path";
import { uuid } from "uuidv4";
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
    BadRequestException,
    ForbiddenException
} from "@nestjs/common";
import { AuthorCheckInterceptor } from "../../common/interceptor/author-check.interceptor";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "../../common/auth/guards/jwt.guard";
import { diskStorage } from "multer";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserInfo } from "../../common/types/user-info.type";

import { IPostService, POST_SERVICE } from "./interface/post-service.interface";

import { RequestSuccessDto } from "../../common/dto/request-success.dto";
import { GetPostDto } from "./dto/get-post.dto";
import { SearchPostDto } from "./dto/search-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { FileDto } from "./dto/file.dto";
import { PhotoDto } from "./dto/photo.dto";
import { FileHelperService } from "../../common/helpers/file-helper.service";

@Controller("posts")
export class PostController {

    constructor(
        @Inject(POST_SERVICE)
        private readonly postService: IPostService
    ) {}

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get()
    async getPosts(@Query() query: GetPostDto) {
        return await this.postService.getPosts(query);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get("search")
    async searchPosts(@Query() query: SearchPostDto) {
        return await this.postService.searchPosts(query);
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
    async uploadFiles(@Param("id") id: number, @UploadedFiles() files: Express.Multer.File[]) {
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
    async uploadPhotos(@Param("id") id: number, @UploadedFiles() files: Express.Multer.File[]) {
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
    async createPost(@CurrentUser() user: UserInfo, @Body() body: CreatePostDto) {
        const id = await this.postService.createPost(user.id, body);
        return { id: id };
    }

    @UseGuards(JwtGuard)
    @Patch(":id")
    async updatePost(@CurrentUser() user: UserInfo, @Param("id") id: number, @Body() body: UpdatePostDto) {
        const isAuthor = await this.postService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.postService.updatePost(id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(JwtGuard)
    @Delete(":id")
    async deletePost(@CurrentUser() user: UserInfo, @Param("id") id: number) {
        const isAuthor = await this.postService.checkIsAuthor(id, user.id);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        await this.postService.deletePost(id);
        return new RequestSuccessDto();
    }
}