import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HOUSE_API_ROUTES } from '../../../core/config/routes/house-routes.config';
import { TOWNHOUSE_API_ROUTES } from '../../../core/config/routes/townhouse-routes.config';
import {
    HouseFormValue,
    HousesBatchFormValue,
    SystemAdminHouse,
    SystemAdminTownhouseDetails,
    SystemAdminTownhouseListItem,
    TownhouseFormValue,
    UpdateTownhousePayload,
} from '../models/admin-townhouse.model';

@Injectable({ providedIn: 'root' })
export class AdminTownhouseService {
    private readonly _httpClient = inject(HttpClient);

    getAll(): Observable<SystemAdminTownhouseListItem[]> {
        return this._httpClient.get<SystemAdminTownhouseListItem[]>(TOWNHOUSE_API_ROUTES.root);
    }

    getOne(townhouseId: number): Observable<SystemAdminTownhouseDetails> {
        return this._httpClient.get<SystemAdminTownhouseDetails>(TOWNHOUSE_API_ROUTES.byId(townhouseId));
    }

    create(payload: TownhouseFormValue): Observable<SystemAdminTownhouseDetails> {
        return this._httpClient.post<SystemAdminTownhouseDetails>(TOWNHOUSE_API_ROUTES.root, payload);
    }

    update(townhouseId: number, payload: UpdateTownhousePayload): Observable<SystemAdminTownhouseDetails> {
        return this._httpClient.patch<SystemAdminTownhouseDetails>(TOWNHOUSE_API_ROUTES.byId(townhouseId), payload);
    }

    delete(townhouseId: number): Observable<void> {
        return this._httpClient.delete<void>(TOWNHOUSE_API_ROUTES.byId(townhouseId));
    }

    createHouses(payload: HousesBatchFormValue): Observable<SystemAdminHouse[]> {
        return this._httpClient.post<SystemAdminHouse[]>(HOUSE_API_ROUTES.batch, payload);
    }

    updateHouse(houseId: number, payload: HouseFormValue): Observable<SystemAdminHouse> {
        return this._httpClient.patch<SystemAdminHouse>(HOUSE_API_ROUTES.byId(houseId), payload);
    }

    deleteHouse(houseId: number): Observable<void> {
        return this._httpClient.delete<void>(HOUSE_API_ROUTES.byId(houseId));
    }
}
