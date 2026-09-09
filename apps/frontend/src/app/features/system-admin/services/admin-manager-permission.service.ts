import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TOWNHOUSE_API_ROUTES } from '../../../core/config/routes/townhouse-routes.config';
import { AdminManagerPermission } from '../models/admin-manager-permission.model';

@Injectable({ providedIn: 'root' })
export class AdminManagerPermissionService {
    private readonly _httpClient = inject(HttpClient);

    getActive(townhouseId: number): Observable<AdminManagerPermission[]> {
        return this._httpClient.get<AdminManagerPermission[]>(TOWNHOUSE_API_ROUTES.managerPermissions(townhouseId));
    }

    grant(townhouseId: number, userId: string): Observable<AdminManagerPermission> {
        return this._httpClient.post<AdminManagerPermission>(TOWNHOUSE_API_ROUTES.managerPermissions(townhouseId), {
            userId,
        });
    }

    revoke(townhouseId: number, userId: string): Observable<void> {
        return this._httpClient.delete<void>(TOWNHOUSE_API_ROUTES.managerPermission(townhouseId, userId));
    }
}
