import {
    Injectable,
    Inject,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    ForbiddenException
} from "@nestjs/common";
import { POST_SERVICE, IPostService } from "../../features/post/interface/post-service.interface";

@Injectable()
export class AuthorCheckInterceptor implements NestInterceptor {

    constructor(
        @Inject(POST_SERVICE)
        private readonly postService: IPostService
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const postId = Number(request.params.id);

        const isAuthor = await this.postService.checkIsAuthor(user.id, postId);
        if(!isAuthor) {
            throw new ForbiddenException("Permission denied");
        }

        return next.handle();
    }
}