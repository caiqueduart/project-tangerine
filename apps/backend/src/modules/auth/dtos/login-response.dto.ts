import { AuthSessionDto } from './auth-session.dto';
import { AuthTokensDto } from './auth-tokens.dto';

export class LoginResponseDto extends AuthTokensDto {
    session: AuthSessionDto;
}
