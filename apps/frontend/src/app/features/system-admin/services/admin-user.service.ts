import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { USER_API_ROUTES } from '../../../core/config/routes/user-routes.config';
import {
    AdminUser,
    AdminUserCreationResult,
    AdminUserDetails,
    AdminUserFormValue,
    ProvisionalPasswordResult,
} from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
    private readonly _httpClient = inject(HttpClient);

    getAll(townhouseId?: number): Observable<AdminUser[]> {
        const params = townhouseId ? new HttpParams().set('townhouseId', townhouseId) : undefined;

        return this._httpClient.get<AdminUser[]>(USER_API_ROUTES.all, { params });
    }

    create(payload: AdminUserFormValue): Observable<AdminUserCreationResult> {
        return this._httpClient.post<AdminUserCreationResult>(USER_API_ROUTES.root, payload);
    }

    getDetails(userId: string): Observable<AdminUserDetails> {
        return this._httpClient.get<AdminUserDetails>(USER_API_ROUTES.details(userId));
    }

    update(userId: string, payload: Partial<AdminUserFormValue>): Observable<AdminUser> {
        return this._httpClient.patch<AdminUser>(USER_API_ROUTES.byId(userId), payload);
    }

    regenerateProvisionalPassword(userId: string): Observable<ProvisionalPasswordResult> {
        return this._httpClient.post<ProvisionalPasswordResult>(USER_API_ROUTES.provisionalPassword(userId), null);
    }
}
