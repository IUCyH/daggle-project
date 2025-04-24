import {
    PipeTransform,
    Injectable,
    BadRequestException,
    ArgumentMetadata
} from "@nestjs/common";

/**
 * body의 필드가 모두 undefined라면 400 에러를 반환합니다.
 */
@Injectable()
export class AllFiledUndefinedTestPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value || typeof value !== "object") {
            throw new BadRequestException("Invalid request body");
        }

        const isAllUndefined = Object.values(value).every(v => v === undefined);
        if(isAllUndefined) {
            throw new BadRequestException("At least one field must be provided");
        }

        return value;
    }
}