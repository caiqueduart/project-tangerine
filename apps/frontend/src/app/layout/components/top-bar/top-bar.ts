import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TownhouseContextService } from '../../../core/townhouse/townhouse-context.service';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { BREAKPOINT_QUERIES } from '../../../core/config/breakpoints.config';
import { AccountMenuContent } from '../account-menu-content/account-menu-content';

@Component({
    selector: 'app-top-bar',
    imports: [AccountMenuContent, MatBottomSheetModule, MatButtonModule, MatIconModule, MatMenuModule],
    templateUrl: './top-bar.html',
    styleUrl: './top-bar.scss',
})
export class TopBar {
    private readonly bottomSheet = inject(MatBottomSheet);
    private readonly breakpointObserver = inject(BreakpointObserver);
    private readonly authSession = inject(AuthSessionService);

    readonly townhouseContext = inject(TownhouseContextService);
    readonly isDesktop = signal(false);
    readonly townhouseName = computed(
        () =>
            this.authSession.session()?.house?.townhouse.name ??
            this.townhouseContext.currentTownhouse()?.name ??
            'Condomínio',
    );
    readonly houseIdentifier = computed(() => this.authSession.session()?.house?.identifier ?? 'Residência');

    constructor() {
        this.breakpointObserver
            .observe(BREAKPOINT_QUERIES.lg)
            .pipe(takeUntilDestroyed())
            .subscribe(({ matches }) => this.isDesktop.set(matches));
    }

    openAccountSheet(): void {
        if (this.isDesktop()) {
            return;
        }

        this.bottomSheet.open(AccountMenuContent, {
            panelClass: 'account-sheet-panel',
            backdropClass: 'account-sheet-backdrop',
            ariaLabel: 'Minha conta',
        });
    }
}
