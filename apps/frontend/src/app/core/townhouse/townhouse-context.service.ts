import { Injectable, signal } from '@angular/core';
import { catchError, delay, Observable, of, tap } from 'rxjs';
import { TownhouseContext } from './townhouse-context';

const MOCK_TOWNHOUSES: readonly TownhouseContext[] = [
    {
        slug: 'corumba',
        name: 'Corumbá II',
        subtitle: 'Gestão do condomínio',
    },
    {
        slug: 'lago-das-rosas',
        name: 'Lago das Rosas',
        subtitle: 'Gestão do condomínio',
    },
];

@Injectable({ providedIn: 'root' })
export class TownhouseContextService {
    private readonly _slug = signal<string | null>(null);
    private readonly _currentTownhouse = signal<TownhouseContext | null>(null);
    private readonly _loading = signal(true);

    readonly slug = this._slug.asReadonly();
    readonly currentTownhouse = this._currentTownhouse.asReadonly();
    readonly loading = this._loading.asReadonly();

    loadBySlug(slug: string): Observable<TownhouseContext | null> {
        const normalizedSlug = slug.trim().toLowerCase();
        const context = MOCK_TOWNHOUSES.find((townhouse) => townhouse.slug === normalizedSlug) ?? null;

        this._slug.set(normalizedSlug);
        this._currentTownhouse.set(null);
        this._loading.set(true);

        // Simula a latência do futuro endpoint público de contexto do condomínio.
        return of(context).pipe(
            delay(150),
            tap((loadedTownhouse) => this.finishLoading(normalizedSlug, loadedTownhouse)),
            catchError(() => {
                this.finishLoading(normalizedSlug, null);
                return of(null);
            }),
        );
    }

    private finishLoading(requestedSlug: string, townhouse: TownhouseContext | null): void {
        if (this._slug() !== requestedSlug) {
            return;
        }

        this._currentTownhouse.set(townhouse);
        this._loading.set(false);
    }
}
