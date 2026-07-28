import { HashServiceProtocol } from '../hash.model';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService extends HashServiceProtocol {
    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async compare(password: string): Promise<boolean> {
        return bcrypt.compare(password, password);
    }
}
