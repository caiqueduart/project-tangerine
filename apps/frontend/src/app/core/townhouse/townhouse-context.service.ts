import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { catchError, finalize, map, Observable, of, tap, timeout } from 'rxjs';
import { TownhouseContextModel } from '../config/models/townhouse-context.model';
import { TOWNHOUSE_API_ROUTES } from '../config/routes/townhouse-routes.config';

interface TownhouseResponse {
    id: number;
    name: string;
    slug: string;
}

export type TownhouseContextError = 'inactive' | 'not-found' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class TownhouseContextService {
    private readonly http = inject(HttpClient);
    private readonly title = inject(Title);
    private readonly _slug = signal<string | null>(null);
    private readonly _currentTownhouse = signal<TownhouseContextModel | null>(null);
    private readonly _loading = signal(false);
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

        return this.http.get<TownhouseResponse>(TOWNHOUSE_API_ROUTES.bySlug(normalizedSlug)).pipe(
            timeout(15_000),
            map((townhouse) => ({
                ...townhouse,
                subtitle: 'Gestão do condomínio',
            })),
            tap((townhouse) => this._finishLoading(normalizedSlug, townhouse, null)),
            catchError((error: unknown) => {
                const contextError: TownhouseContextError =
                    error instanceof HttpErrorResponse && error.status === 404
                        ? 'not-found'
                        : error instanceof HttpErrorResponse && error.status === 403
                          ? 'inactive'
                          : 'unavailable';
                this._finishLoading(normalizedSlug, null, contextError);
                return of(null);
            }),
            finalize(() => {
                if (this._slug() === normalizedSlug) {
                    this._loading.set(false);
                }
            }),
        );
    }

    private _finishLoading(
        requestedSlug: string,
        townhouse: TownhouseContextModel | null,
        error: TownhouseContextError | null,
    ): void {
        if (this._slug() !== requestedSlug) {
            return;
        }

        this._currentTownhouse.set(townhouse);
        this._error.set(error);
        this._loading.set(false);
        this.title.setTitle(townhouse ? `${townhouse.name} | Tangerine` : 'Tangerine');
    }
}
