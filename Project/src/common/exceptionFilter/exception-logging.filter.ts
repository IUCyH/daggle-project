import {
    ExceptionFilter,
    Injectable,
    Inject,
    Catch,
    ArgumentsHost,
    HttpException
} from "@nestjs/common";
import { Request, Response } from "express";
import { LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { TypeORMError } from "typeorm";
import { ServiceException } from "../exceptions/service-exception";
import { RequestFailedDto } from "../dto/request-failed.dto";

@Injectable()
@Catch()
export class ExceptionLoggingFilter implements ExceptionFilter {

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService
    ) {}

    catch(exception: any, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        const { className, methodName } = this.getContextMetaData(exception);

        const result = this.handleException(exception);
        const dto = result.dto;
        const log = result.log;

        this.logger.warn(`${request.method} ${request.url} ${dto.statusCode}: ${log} at ${className}.${methodName}`, "ExceptionLoggingFilter");
        response.status(dto.statusCode).json(dto);
    }

    /**
     * Error 객체에서 Stack의 첫 줄의 Class 이름과 Method 이름을 추출해 반환합니다.
     * @param exception
     * @private
     */
    private getContextMetaData(exception: any) {
        const result = { className: "Unknown", methodName: "Unknown" };

        if(exception instanceof Error && exception.stack) {
            const splitResult = exception.stack.split("\n");
            const firstLine = splitResult.find((line: string) => line.trim().startsWith("at"));
            const matches = firstLine?.match(/at\s+(?:(.+?)\.)?(.*?)\s+\((.+?)\)/);

            if(matches) {
                result.className = matches[1] ?? "Global";
                result.methodName = matches[2] ?? "Unknown";
            }
        }

        return result;
    }

    private handleException(exception: any) {
        const dto = new RequestFailedDto();
        let log = "";

        dto.response = { message: "Request failed" };

        if(exception instanceof HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();

            dto.statusCode = status;

            if(typeof response === "string") {
                log = response;
            } else {
                dto.response = response;
                log = exception.message;
            }
        } else if(exception instanceof  TypeORMError) {
            let status = 500;
            const message = exception.message;

            if(message.includes("ER_DUP_ENTRY")) {
                status = 400;
            }

            dto.statusCode = status;
            log = message;
        } else if(exception instanceof ServiceException) {
            const status = exception.statusCode;
            const message = exception.message;

            dto.statusCode = status;
            log = message;
        } else {
            const message = exception.message;

            dto.statusCode = 500;
            log = message;
        }

        return { dto: dto, log: log };
    }
}