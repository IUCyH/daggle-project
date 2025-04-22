import {
    Injectable,
    Inject,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    LoggerService
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService
    ) {}

    intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
        const request: Request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - now;
                const response: Response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                this.logger.debug?.(`${method} ${url} ${statusCode} ${ms}ms`);
            })
        );
    }
}