import { ApiProperty } from "@nestjs/swagger";

export class FileDto {

    @ApiProperty({ example: "file.jpg" })
    name!: string;

    @ApiProperty({ example: "/static/file.jpg" })
    url!: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}