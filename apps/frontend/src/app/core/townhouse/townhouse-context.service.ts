import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { TownhouseContextModel } from './townhouse-context.model';

interface TownhouseResponse {
    id: number;
    name: string;
    slug: string;
}

export type TownhouseContextError = 'not-found' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class TownhouseContextService {
    private readonly http = inject(HttpClient);
    private readonly title = inject(Title);
    private readonly _slug = signal<string | null>(null);
    private readonly _currentTownhouse = signal<TownhouseContextModel | null>(null);
    private readonly _loading = signal(true);
    private readonly _error = signal<TownhouseContextError | null>(null);

    readonly slug = this._slug.asReadonly();
    readonly currentTownhouse = this._currentTownhouse.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    loadBySlug(slug: string): Observable<TownhouseContextModel | null> {
        const normalizedSlug = slug.trim().toLowerCase();

        this._slug.set(normalizedSlug);
        this._currentTownhouse.set(null);
        this._loading.set(true);
        this._error.set(null);

        return this.http.get<TownhouseResponse>(`${API_BASE_URL}/townhouse/by-slug/${encodeURIComponent(normalizedSlug)}`).pipe(
            map((townhouse) => ({
                ...townhouse,
                subtitle: 'Gestão do condomínio',
            })),
            tap((townhouse) => this._finishLoading(normalizedSlug, townhouse, null)),
            catchError((error: unknown) => {
                const contextError: TownhouseContextError = error instanceof HttpErrorResponse && error.status === 404 ? 'not-found' : 'unavailable';
                this._finishLoading(normalizedSlug, null, contextError);
                return of(null);
            }),
        );
    }

    private _finishLoading(requestedSlug: string, townhouse: TownhouseContextModel | null, error: TownhouseContextError | null): void {
        if (this._slug() !== requestedSlug) {
            return;
        }

        this._currentTownhouse.set(townhouse);
        this._error.set(error);
        this._loading.set(false);
        this.title.setTitle(townhouse ? `${townhouse.name} | Tangerine` : 'Tangerine');
    }
}
