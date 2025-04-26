import { ApiProperty } from "@nestjs/swagger";

export class ToggleLikeDto {

    @ApiProperty({ example: true })
    liked!: boolean;

    constructor(liked: boolean) {
        this.liked = liked;
    }
}