import { AuthenticationSessionDto } from './authentication-session.dto';
import { AccessTokenDto } from './access-token.dto';

export class LoginResponseDto extends AccessTokenDto {
    session: AuthenticationSessionDto;
}
