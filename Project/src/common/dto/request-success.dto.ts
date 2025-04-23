export class RequestSuccessDto {
    message: string;

    constructor(message: string = "Request success") {
        this.message = message;
    }
}