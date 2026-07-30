import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, map, switchMap } from 'rxjs';
import { TOWNHOUSE_PARAMS } from '../../config/routes/townhouse-routes.config';
import { TownhouseContextService } from '../townhouse-context.service';

@Component({
    selector: 'app-townhouse-shell',
    imports: [RouterOutlet],
    templateUrl: './townhouse-shell.html',
})
export class TownhouseShell {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    readonly townhouseContext = inject(TownhouseContextService);

    constructor() {
        this.route.paramMap
            .pipe(
                map((parameters) => parameters.get(TOWNHOUSE_PARAMS.slug) ?? ''),
                distinctUntilChanged(),
                switchMap((slug) => this.townhouseContext.loadBySlug(slug)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
