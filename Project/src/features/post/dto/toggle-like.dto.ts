export class ToggleLikeDto {

    liked!: boolean;

    constructor(liked: boolean) {
        this.liked = liked;
    }
}