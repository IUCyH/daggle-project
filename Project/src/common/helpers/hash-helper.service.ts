import { Injectable } from "@nestjs/common";
import argon2 from "argon2";

@Injectable()
export class HashHelperService {
    private readonly hashOptions = {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        parallelism: 2,
        hashLength: 32,
        secret: process.env.HASH_PEPPER ? Buffer.from(process.env.HASH_PEPPER) : undefined
    };

    async hash(value: string): Promise<string> {
        return await argon2.hash(value, this.hashOptions);
    }

    async verify(hash: string, value: string): Promise<boolean> {
        return await argon2.verify(hash, value, { secret: this.hashOptions.secret });
    }
}