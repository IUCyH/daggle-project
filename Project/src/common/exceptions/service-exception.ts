export class ServiceException extends Error {
    readonly statusCode: number = 500;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}