export const AUTH_SERVICE = "AuthService";

export interface IAuthService {

    getUserIdByEmailAndPassword(email: string, password: string): Promise<number>;
    generateRefreshToken(userId: number): Promise<string>;
    generateAccessToken(userId: number): Promise<string>;
    invalidateTokenPair(userId: number): Promise<void>;
}