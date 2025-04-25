import "express";
import { UserInfo } from "./user-info.type";

declare global {
    namespace Express {
        // eslint-disable-next-line
        interface User extends UserInfo {}
        interface Request {
            uploadStarted: boolean;
        }
    }
}