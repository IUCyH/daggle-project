import { FileDto } from "./file.dto";
import { PhotoDto } from "./photo.dto";
import { ApiProperty } from "@nestjs/swagger";

export class PostDetailDto {

    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: [] })
    files!: FileDto[];

    @ApiProperty({ example: [] })
    photos!: PhotoDto[];
}