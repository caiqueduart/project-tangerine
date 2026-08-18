import { AuthenticationSessionDto } from './authentication-session.dto';
import { AuthenticationTokensDto } from './authentication-tokens.dto';

export class LoginResultDto extends AuthenticationTokensDto {
    session: AuthenticationSessionDto;
}
