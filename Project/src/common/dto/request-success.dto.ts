import { ApiProperty } from "@nestjs/swagger";

export class RequestSuccessDto {
    @ApiProperty({ example: "Request success" })
    message: string;

    constructor(message: string = "Request success") {
        this.message = message;
    }
}