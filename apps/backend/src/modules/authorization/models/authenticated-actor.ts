import { UserRole } from '../../user/enums/user-role';
import { UserSituation } from '../../user/enums/user-situation';

export interface AuthenticatedActor {
    userId: string;
    role: UserRole;
    situation: UserSituation;
    townhouseId?: number;
    houseId?: number;
    residentialTownhouseId?: number;
    managedTownhouseIds: readonly number[];
}
