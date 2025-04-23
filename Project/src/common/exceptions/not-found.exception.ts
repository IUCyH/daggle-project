import { ServiceException } from "./service-exception";

export class NotFoundException extends ServiceException {
    constructor(message: string = "Data not found") {
        super(404, message);
    }
}