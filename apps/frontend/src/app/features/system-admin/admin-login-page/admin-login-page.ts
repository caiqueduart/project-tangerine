import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
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
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';

@Component({
    selector: 'app-admin-login-page',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    templateUrl: './admin-login-page.html',
    styleUrl: './admin-login-page.scss',
})
export class AdminLoginPage {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _authService = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _formBuilder = inject(FormBuilder);
    private readonly _router = inject(Router);

    readonly submitting = signal(false);
    readonly submitError = signal<string | null>(null);
    readonly passwordVisible = signal(false);

    readonly form = this._formBuilder.nonNullable.group({
        identifier: ['', Validators.required],
        password: ['', Validators.required],
    });

    togglePasswordVisibility(): void {
        this.passwordVisible.update((visible) => !visible);
    }

    submit(): void {
        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { identifier, password } = this.form.getRawValue();

        this.submitting.set(true);
        this.submitError.set(null);

        this._authService
            .login({ uid: identifier.trim(), password })
            .pipe(
                finalize(() => this.submitting.set(false)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: () => {
                    this.form.controls.password.reset();
                    void this._navigateAfterLogin();
                },
                error: (error: unknown) => this.submitError.set(this._getLoginErrorMessage(error)),
            });
    }

    private async _navigateAfterLogin(): Promise<void> {
        const returnUrl = this._activatedRoute.snapshot.queryParamMap.get('returnUrl');
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
