import { ApiProperty } from "@nestjs/swagger";

export class PhotoDto {

    @ApiProperty({ example: "/static/photo.jpg" })
    url!: string;

    constructor(url: string) {
        this.url = url;
    }
}