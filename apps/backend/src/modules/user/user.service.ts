import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { HashService } from '../common/services/hash.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUserDto } from './dtos/get-user.dto';
import { Resident } from './entities/resident.entity';
import { House } from '../house/entities/house.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private _userRepository: Repository<User>,
        private _hashService: HashService,
    ) {}

    async register(dto: CreateUserDto): Promise<GetUserDto> {
        try {
            const passwordHash = await this._hashService.hash(dto.password);

            return await this._userRepository.manager.transaction(async (manager) => {
                const user = manager.create(User, {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    passwordHash,
                    email: dto.email ?? null,
                    phone: dto.phone,
                });

                const savedUser = await manager.save(user);

                if (dto.houseId === undefined) {
                    return this._toGetUserDto(savedUser);
                }

                const house = await manager.findOne(House, {
                    where: { id: dto.houseId },
                    relations: { townhouse: true },
                });

                if (!house) {
                    throw new NotFoundException('Casa não encontrada.');
                }

                const resident = manager.create(Resident, {
                    userId: savedUser.id,
                    user: savedUser,
                    houseId: house.id,
                    house,
                });

                await manager.save(resident);

                savedUser.resident = resident;
                return this._toGetUserDto(savedUser);
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException('Erro ao registrar usuário.');
        }
    }

    async get(userId: string): Promise<GetUserDto> {
        try {
            const user = await this._userRepository.findOne({
                where: { id: userId },
                relations: { resident: { house: { townhouse: true } } },
            });
            if (!user) throw new NotFoundException('Usuário não encontrado.');

            return this._toGetUserDto(user);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    async getAll(): Promise<GetUserDto[]> {
        try {
            const users = await this._userRepository.find({
                relations: { resident: { house: { townhouse: true } } },
            });

            return users.map((user) => this._toGetUserDto(user));
        } catch {
            throw new InternalServerErrorException('Erro ao consultar usuários.');
        }
    }

    async findUserByLogin(login: string): Promise<User | null> {
        try {
            return await this._userRepository.findOne({ where: [{ email: login }, { phone: login }] });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException('Erro ao consultar usuário.');
        }
    }

    private _toGetUserDto(user: User): GetUserDto {
        const house = user.resident?.house;

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            situation: user.situation,
            house: house
                ? {
                      id: house.id,
                      identifier: house.identifier,
                      townhouse: { id: house.townhouse.id },
                  }
                : null,
        };
    }
}
