import { ApiProperty } from "@nestjs/swagger";

export class RequestFailedDto {
    @ApiProperty({ example: 500 })
    statusCode: number = 0;

    @ApiProperty({ example: { message: "Request failed" }})
    response: object = {};
}