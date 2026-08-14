export type TownhouseSituation = 'ACTIVE' | 'INACTIVE';

export interface SystemAdminTownhouseListItem {
    readonly id: number;
    readonly name: string;
    readonly slug: string;
    readonly situation: TownhouseSituation;
    readonly createdAt: string;
    readonly houseCount: number;
    readonly residentCount: number;
}

export interface SystemAdminTownhouseOption {
    readonly id: number;
    readonly name: string;
}

export interface SystemAdminHouse {
    readonly id: number;
    readonly identifier: string;
    readonly residentCount: number;
}

export interface SystemAdminHouseOption {
    readonly id: number;
    readonly identifier: string;
}

export interface SystemAdminTownhouseDetails extends SystemAdminTownhouseListItem {
    readonly houses: readonly SystemAdminHouse[];
}

export interface TownhouseFormValue {
    readonly name: string;
    readonly slug: string;
}

export interface UpdateTownhousePayload extends Partial<TownhouseFormValue> {
    readonly situation?: TownhouseSituation;
}

export interface HouseFormValue {
    readonly townhouseId: number;
    readonly identifier: string;
}

export interface HousesBatchFormValue {
    readonly townhouseId: number;
    readonly identifiers: readonly string[];
}
