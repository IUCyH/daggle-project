import { TokenPairDto } from "../dto/token-pair.dto";

export const AUTH_SERVICE = "AuthService";

export interface IAuthService {

    getUserIdByEmailAndPassword(email: string, password: string): Promise<number>;
    generateAndSaveTokenPair(userId: number): Promise<TokenPairDto>;
    invalidateTokenPair(userId: number): Promise<void>;
}