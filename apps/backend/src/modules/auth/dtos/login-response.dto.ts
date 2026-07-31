import { AuthSessionDto } from './auth-session.dto';
import { AccessTokenDto } from './access-token.dto';

export class LoginResponseDto extends AccessTokenDto {
    session: AuthSessionDto;
}
