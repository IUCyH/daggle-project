import { ServiceException } from "./service-exception";

export class BadRequestException extends ServiceException {
    constructor(message: string = "Bad Request") {
        super(400, message);
    }
}