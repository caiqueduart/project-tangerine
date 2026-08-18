import { UserRole } from '../../user/enums/user-role';

export interface AuthenticatedActor {
    userId: string;
    role: UserRole;
    houseId?: number;
    townhouseId?: number;
}
