import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_PATTERN = /^(?=.*\p{L})(?=.*\p{N}).+$/u;
const PASSWORD_MESSAGE = 'A senha deve conter pelo menos uma letra e um número.';

export class CompleteFirstAccessDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @MinLength(8)
    @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
    newPassword: string;
}

export class ChangePasswordDto extends CompleteFirstAccessDto {
    @IsNotEmpty()
    @IsString()
    currentPassword: string;
}

export class ProvisionalPasswordDto {
    provisionalPassword: string;
}
