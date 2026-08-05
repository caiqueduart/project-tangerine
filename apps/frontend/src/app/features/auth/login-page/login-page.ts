import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TownhouseContextService } from '../../../core/townhouse/townhouse-context.service';
import { AUTH_ROUTES } from '../../../core/config/routes/auth-routes.config';
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';
import { TOWNHOUSE_ROUTES } from '../../../core/config/routes/townhouse-routes.config';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { LOGIN_PAGE_ROUTE_DATA_KEY, LoginPageConfig } from './login-page.config';

@Component({
    selector: 'app-login-page',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {
    private readonly _townhouseContextService = inject(TownhouseContextService);
    private readonly _authService = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _formBuilder = inject(FormBuilder);
    private readonly _route = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _snackbar = inject(SnackbarService);

    readonly config = this._route.snapshot.data[LOGIN_PAGE_ROUTE_DATA_KEY] as LoginPageConfig;
    readonly isTownhouseLogin = this.config.context === 'townhouse';
    readonly townhouse = this._townhouseContextService.currentTownhouse;
    readonly townhouseError = this._townhouseContextService.error;
    readonly submitting = signal(false);
    readonly passwordVisible = signal(false);
    readonly canDisplayLogin = computed(() => !this.isTownhouseLogin || Boolean(this.townhouse()));
    readonly title = computed(() => this.townhouse()?.name ?? this.config.title ?? 'Acesso');
    readonly subtitle = computed(() => this.townhouse()?.subtitle ?? this.config.subtitle);

    readonly loginForm = this._formBuilder.nonNullable.group({
        identifier: ['', Validators.required],
        password: ['', Validators.required],
    });

    togglePasswordVisibility(): void {
        this.passwordVisible.update((visible) => !visible);
    }

    submit(): void {
        const townhouse = this.townhouse();

        if ((this.isTownhouseLogin && !townhouse) || this.loginForm.invalid || this.submitting()) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { identifier, password } = this.loginForm.getRawValue();

        this.submitting.set(true);

        this._authService
            .login(
                {
                    uid: identifier.trim(),
                    password,
                },
                townhouse?.slug,
            )
            .pipe(
                finalize(() => this.submitting.set(false)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: () => {
                    this.loginForm.controls.password.reset();
                    void this._navigateAfterLogin(townhouse?.slug);
                },
                error: (error: unknown) => {
                    this._snackbar.error(this._getLoginErrorMessage(error));
                },
            });
    }

    private async _navigateAfterLogin(townhouseSlug?: string): Promise<void> {
        const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl');

        if (!this.isTownhouseLogin) {
            const adminRootUrl = this._router.serializeUrl(this._router.createUrlTree(SYSTEM_ADMIN_ROUTES.root));
            const adminLoginUrl = this._router.serializeUrl(this._router.createUrlTree(SYSTEM_ADMIN_ROUTES.login));

            if (
                returnUrl &&
                this._isWithinRoute(returnUrl, adminRootUrl) &&
                !this._isWithinRoute(returnUrl, adminLoginUrl)
            ) {
                await this._router.navigateByUrl(returnUrl);
                return;
            }

            await this._router.navigate(SYSTEM_ADMIN_ROUTES.root);
            return;
        }

        if (!townhouseSlug) {
            return;
        }

        const townhouseRootUrl = this._router.serializeUrl(
            this._router.createUrlTree(TOWNHOUSE_ROUTES.home(townhouseSlug)),
        );
        const authenticationRootUrl = this._router.serializeUrl(
            this._router.createUrlTree(AUTH_ROUTES.root(townhouseSlug)),
        );

        if (
            returnUrl &&
            this._isWithinRoute(returnUrl, townhouseRootUrl) &&
            !this._isWithinRoute(returnUrl, authenticationRootUrl)
        ) {
            await this._router.navigateByUrl(returnUrl);
            return;
        }

        await this._router.navigate(TOWNHOUSE_ROUTES.home(townhouseSlug));
    }

    private _getLoginErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse && error.status === 401) {
            return 'Telefone, e-mail ou senha inválidos.';
        }

        if (error instanceof HttpErrorResponse && error.status === 0) {
            return 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        }

        return 'Não foi possível entrar. Tente novamente mais tarde.';
    }

    private _isWithinRoute(url: string, routeRootUrl: string): boolean {
        return url === routeRootUrl || url.startsWith(`${routeRootUrl}/`) || url.startsWith(`${routeRootUrl}?`);
    }
}
