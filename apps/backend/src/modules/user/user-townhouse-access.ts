import { ManagerPermissionSituation } from '../manager-permission/enums/manager-permission-situation';
import { TownhouseSituation } from '../townhouse/enums/townhouse-situation.enum';
import type { User } from './entities/user.entity';

export function getActiveResidentialTownhouseId(user: User): number | undefined {
    const townhouse = user.resident?.house.townhouse;

    return townhouse?.situation === TownhouseSituation.ACTIVE ? townhouse.id : undefined;
}

export function getActiveManagedTownhouseIds(user: User): number[] {
    return (user.managerPermissions ?? [])
        .filter(
            (permission) =>
                permission.situation === ManagerPermissionSituation.ACTIVE &&
                permission.townhouse.situation === TownhouseSituation.ACTIVE,
        )
        .map((permission) => permission.townhouseId);
}

export function hasActiveTownhouseAccess(user: User, townhouseId: number): boolean {
    return (
        getActiveResidentialTownhouseId(user) === townhouseId ||
        getActiveManagedTownhouseIds(user).includes(townhouseId)
    );
}
