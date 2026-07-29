import { UserSituation } from '../../user/enums/user-situation';

export class TokenPayloadDto {
    id: string;
    phone: string;
    email: string;
    situation: UserSituation;
}
