import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'node:crypto';

// Sem caracteres que se confundem ao ditar ou ler a senha (0/O/o, 1/I/l).
const UNAMBIGUOUS_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
const UNAMBIGUOUS_DIGITS = '23456789';
const ALPHABET = `${UNAMBIGUOUS_LETTERS}${UNAMBIGUOUS_DIGITS}`;
const PASSWORD_LENGTH = 10;

@Injectable()
export class ProvisionalPasswordService {
    constructor(private readonly _configService: ConfigService) {}

    generate(): string {
        const characters = [
            this._randomItem(UNAMBIGUOUS_LETTERS),
            this._randomItem(UNAMBIGUOUS_DIGITS),
            ...Array.from({ length: PASSWORD_LENGTH - 2 }, () => this._randomItem(ALPHABET)),
        ];

        return this._shuffle(characters).join('');
    }

    getExpirationDate(from = new Date()): Date {
        const ttlHours = this._configService.getOrThrow<number>('PROVISIONAL_PASSWORD_TTL_HOURS');
        return new Date(from.getTime() + ttlHours * 60 * 60 * 1000);
    }

    private _randomItem(values: string): string {
        return values[randomInt(values.length)];
    }

    private _shuffle(values: string[]): string[] {
        for (let index = values.length - 1; index > 0; index -= 1) {
            const swapIndex = randomInt(index + 1);
            [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
        }

        return values;
    }
}
