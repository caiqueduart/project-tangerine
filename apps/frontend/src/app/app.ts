import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { SystemLoadingComponent } from './shared/components/system-loading/system-loading.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, SystemLoadingComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    private readonly _router = inject(Router);
    private readonly _destroyRef = inject(DestroyRef);
    private _startupTimeout: ReturnType<typeof setTimeout> | undefined;

    readonly ready = signal(false);
    readonly failed = signal(false);

    constructor() {
        this._startupTimeout = setTimeout(() => this.failed.set(true), 30_000);
        this._destroyRef.onDestroy(() => clearTimeout(this._startupTimeout));

        this._router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (event instanceof NavigationEnd) {
                clearTimeout(this._startupTimeout);
                this.ready.set(true);
                this.failed.set(false);
            } else if (event instanceof NavigationError && !this.ready()) {
                clearTimeout(this._startupTimeout);
                this.failed.set(true);
            }
        });
    }

    retry(): void {
        window.location.reload();
    }
}
