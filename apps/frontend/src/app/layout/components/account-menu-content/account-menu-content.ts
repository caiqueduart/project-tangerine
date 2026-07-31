import { Component, inject, output } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AUTH_ROUTES } from '../../../core/config/routes/auth-routes.config';
import { TownhouseContextService } from '../../../core/townhouse/townhouse-context.service';

@Component({
    selector: 'app-account-menu-content',
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './account-menu-content.html',
    styleUrl: './account-menu-content.scss',
})
export class AccountMenuContent {
    private readonly bottomSheetRef = inject(MatBottomSheetRef<AccountMenuContent>, { optional: true });
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly townhouseContext = inject(TownhouseContextService);
    readonly closed = output<void>();
    readonly selectedHouse = 'Casa 7';
    readonly residentName = 'Maria Silva';

    close(): void {
        this.closed.emit();
        this.bottomSheetRef?.dismiss();
    }

    logout(): void {
        const slug = this.townhouseContext.slug();

        this.authService.logout();
        this.close();

        if (slug) {
            void this.router.navigate(AUTH_ROUTES.login(slug));
        }
    }
}
