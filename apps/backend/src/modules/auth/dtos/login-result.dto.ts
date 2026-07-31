import { AuthSessionDto } from './auth-session.dto';
import { AuthTokensDto } from './auth-tokens.dto';

export class LoginResultDto extends AuthTokensDto {
    session: AuthSessionDto;
}
