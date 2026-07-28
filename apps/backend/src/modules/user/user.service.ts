import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, GetUserDto } from './user.dto';
import { BcryptService } from '../auth/services/bcrypt.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private _userRepository: Repository<User>,
        private _bCryptService: BcryptService,
    ) {}

    async register(dto: CreateUserDto): Promise<GetUserDto> {
        try {
            const user = {
                firstName: dto.firstName,
                lastName: dto.lastName,
                passwordHash: await this._bCryptService.hash(dto.password),
                email: dto.email,
                phone: dto.phone,
            };

            const savedUser = await this._userRepository.save(user);
            const { firstName, lastName, email, phone, situation } = savedUser;

            return { firstName, lastName, email, phone, situation };
        } catch (error) {
            throw new InternalServerErrorException('Erro ao registrar usuário.');
        }
    }

    async get(userId: string): Promise<GetUserDto> {
        try {
            const user = await this._userRepository.findOne({ where: { id: userId } });
            if (!user) throw new NotFoundException('Usuário não encontrado.');

            const { passwordHash, ...userDto } = user;
            return userDto as GetUserDto;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    async getAll(): Promise<GetUserDto[]> {
        try {
            return await this._userRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Erro ao consultar usuários.');
        }
    }
}
