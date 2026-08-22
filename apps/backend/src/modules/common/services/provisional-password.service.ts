import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

const FAMILIAR_WORDS = [
    'Agua',
    'Amor',
    'Azul',
    'Bola',
    'Cafe',
    'Casa',
    'Doce',
    'Flor',
    'Fogo',
    'Gato',
    'Lago',
    'Lima',
    'Pato',
    'Pera',
    'Rosa',
    'Suco',
    'Vida',
] as const;
const UNAMBIGUOUS_DIGITS = ['2', '3', '4', '5', '6', '7', '8', '9'] as const;

@Injectable()
export class ProvisionalPasswordService {
    generate(): string {
        const word = this._randomItem(FAMILIAR_WORDS);
        const digits = Array.from({ length: 4 }, () => this._randomItem(UNAMBIGUOUS_DIGITS)).join('');

        return `${word}${digits}`;
    }

    private _randomItem<T>(values: readonly T[]): T {
        return values[randomInt(values.length)];
    }
}
