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
import { Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { APP_ROUTES } from '../../../core/config/routes/app-routes.config';
import { AUTH_ROUTES } from '../../../core/config/routes/auth-routes.config';
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';
import { TOWNHOUSE_ROUTES } from '../../../core/config/routes/townhouse-routes.config';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { SnackbarService } from '../../../shared/services/snackbar.service';

const PASSWORD_PATTERN = /^(?=.*\p{L})(?=.*\p{N}).{8,100}$/u;

@Component({
    selector: 'app-password-page',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    templateUrl: './password-page.html',
    styleUrl: './password-page.scss',
})
export class PasswordPage {
    private readonly _authService = inject(AuthService);
    private readonly _authSessionService = inject(AuthSessionService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _formBuilder = inject(FormBuilder);
    private readonly _router = inject(Router);
    private readonly _snackbar = inject(SnackbarService);

    readonly isFirstAccess = computed(() => this._authSessionService.session()?.user.situation === 'PENDING');
    readonly passwordVisible = signal(false);
    readonly submitting = signal(false);
    readonly form = this._formBuilder.nonNullable.group({
        currentPassword: [''],
        newPassword: [
            '',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(100),
                Validators.pattern(PASSWORD_PATTERN),
            ],
        ],
        confirmPassword: ['', Validators.required],
    });

    constructor() {
        if (!this.isFirstAccess()) {
            this.form.controls.currentPassword.addValidators(Validators.required);
        }
    }

    togglePasswordVisibility(): void {
        this.passwordVisible.update((visible) => !visible);
    }

    submit(): void {
        const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

        if (newPassword !== confirmPassword) {
            this.form.controls.confirmPassword.setErrors({ passwordMismatch: true });
        }

        if (this.form.invalid || this.submitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const isFirstAccess = this.isFirstAccess();
        this.submitting.set(true);
        const request: Observable<unknown> = isFirstAccess
            ? this._authService.completeFirstAccess({ newPassword })
            : this._authService.changePassword({ currentPassword, newPassword });

        request
            .pipe(
                finalize(() => this.submitting.set(false)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: () => {
                    this._snackbar.success(
                        isFirstAccess ? 'Senha definida. Seu acesso está ativo.' : 'Senha alterada.',
                    );
                    void this._navigateToUserArea();
                },
                error: (error: HttpErrorResponse) => {
                    const fallback = isFirstAccess
                        ? 'Não foi possível concluir o primeiro acesso.'
                        : 'Não foi possível alterar a senha.';
                    this._snackbar.error(this._getErrorMessage(error, fallback));
                },
            });
    }

    cancel(): void {
        void this._navigateToUserArea();
    }

    logout(): void {
        const session = this._authSessionService.session();
        this._authService.logout();

        if (session?.house) {
            void this._router.navigate(AUTH_ROUTES.login(session.house.townhouse.slug));
            return;
        }

        void this._router.navigate(SYSTEM_ADMIN_ROUTES.login);
    }

    private async _navigateToUserArea(): Promise<void> {
        const session = this._authSessionService.session();

        if (session?.user.situation === 'PENDING') {
            await this._router.navigate(APP_ROUTES.password);
            return;
        }

        if (session?.user.role === UserRole.SYSTEM_ADMIN) {
            await this._router.navigate(SYSTEM_ADMIN_ROUTES.root);
            return;
        }

        if (session?.house) {
            await this._router.navigate(TOWNHOUSE_ROUTES.home(session.house.townhouse.slug));
            return;
        }

        this._authService.logout();
        await this._router.navigate(SYSTEM_ADMIN_ROUTES.login);
    }

    private _getErrorMessage(error: HttpErrorResponse, fallback: string): string {
        const message = (error.error as { message?: string | string[] } | null)?.message;
        return Array.isArray(message) ? message[0] : (message ?? fallback);
    }
}
