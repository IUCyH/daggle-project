import { FileDto } from "./file.dto";
import { PhotoDto } from "./photo.dto";

export class PostDetailDto {

    id!: number;
    files!: FileDto[];
    photos!: PhotoDto[];
}