import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export abstract class HashServiceProtocol {
    abstract hash(password: string): Promise<string>;
    abstract compare(password: string, passwordHash: string): Promise<boolean>;
}

@Injectable()
export class HashService extends HashServiceProtocol {
    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async compare(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
}
