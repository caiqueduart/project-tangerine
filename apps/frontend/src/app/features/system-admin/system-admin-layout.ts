import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { AuthSessionService } from '../../core/auth/services/auth-session.service';
import { SYSTEM_ADMIN_ROUTES } from '../../core/config/routes/system-admin-routes.config';

@Component({
    selector: 'app-system-admin',
    imports: [MatButtonModule, MatIconModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './system-admin-layout.html',
    styleUrl: './system-admin-layout.scss',
})
export class SystemAdminLayout {
    private readonly _authService = inject(AuthService);
    private readonly _authSessionService = inject(AuthSessionService);
    private readonly _router = inject(Router);

    readonly session = this._authSessionService.session;
    readonly userName = computed(() => {
        const user = this.session()?.user;
        return user ? `${user.firstName} ${user.lastName}`.trim() : 'Administrador';
    });

    readonly userInitials = computed(() => {
        const user = this.session()?.user;
        return user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : 'AD';
    });

    readonly rootRoute = SYSTEM_ADMIN_ROUTES.root;
    readonly townhousesRoute = SYSTEM_ADMIN_ROUTES.townhouses;

    logout(): void {
        this._authService.logout();
        void this._router.navigate(SYSTEM_ADMIN_ROUTES.login);
    }
}
