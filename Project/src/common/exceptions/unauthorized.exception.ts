import { ServiceException } from "./service-exception";

export class UnauthorizedException extends ServiceException {
    constructor(message: string = "Unauthorized") {
        super(401, message);
    }
}