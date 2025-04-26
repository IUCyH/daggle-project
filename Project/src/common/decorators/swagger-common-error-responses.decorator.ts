import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { RequestFailedDto } from "../dto/request-failed.dto";

/**
 * 401, 500 에러 문서화를 한꺼번에 적용시킵니다.
 * @constructor
 */
export const SwaggerCommonErrorResponse = () => {
    return applyDecorators(
        ApiResponse({ status: 401, description: "Unauthorized", type: RequestFailedDto }),
        ApiResponse({ status: 500, description: "Internal Server Error", type: RequestFailedDto })
    );
};