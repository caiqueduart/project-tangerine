import { IsEnum, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserSituation } from '../enums/user-situation';

export class ListUsersQueryDto {
    @IsOptional()
    @IsNumberString({ no_symbols: true })
    page?: string;

    @IsOptional()
    @IsNumberString({ no_symbols: true })
    pageSize?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @IsEnum(UserSituation)
    situation?: UserSituation;

    @IsOptional()
    @IsNumberString({ no_symbols: true })
    townhouseId?: string;
}
