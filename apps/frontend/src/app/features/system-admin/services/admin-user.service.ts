import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { USER_API_ROUTES } from '../../../core/config/routes/user-routes.config';
import { AdminUser, AdminUserDetails, AdminUserFormValue } from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
    private readonly _httpClient = inject(HttpClient);

    getAll(townhouseId?: number): Observable<AdminUser[]> {
        const params = townhouseId ? new HttpParams().set('townhouseId', townhouseId) : undefined;

        return this._httpClient.get<AdminUser[]>(USER_API_ROUTES.all, { params });
    }

    create(payload: AdminUserFormValue): Observable<AdminUser> {
        return this._httpClient.post<AdminUser>(USER_API_ROUTES.root, payload);
    }

    getDetails(userId: string): Observable<AdminUserDetails> {
        return this._httpClient.get<AdminUserDetails>(USER_API_ROUTES.details(userId));
    }

    update(userId: string, payload: Partial<AdminUserFormValue>): Observable<AdminUser> {
        return this._httpClient.patch<AdminUser>(USER_API_ROUTES.byId(userId), payload);
    }

    reject(userId: string): Observable<void> {
        return this._httpClient.delete<void>(USER_API_ROUTES.byId(userId));
    }
}
