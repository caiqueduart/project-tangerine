import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';

@Component({
    selector: 'app-login-page',
    imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {
    private readonly townhouseContextService = inject(TownhouseContextService);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    passwordVisible = false;
    readonly townhouse = this.townhouseContextService.currentTownhouse;
    readonly townhouseError = this.townhouseContextService.error;
    readonly submitError = signal<string | null>(null);
    readonly submitting = signal(false);

    readonly loginForm = new FormGroup({
        identifier: new FormControl('email@email.com', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        password: new FormControl('1234567a', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    submit(): void {
        const townhouse = this.townhouse();

        if (!townhouse || this.loginForm.invalid || this.submitting()) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { identifier, password } = this.loginForm.getRawValue();

        this.submitting.set(true);
        this.submitError.set(null);

        this.authService
            .login(
                {
                    uid: identifier.trim(),
                    password,
                },
                townhouse.slug,
            )
            .pipe(
                finalize(() => this.submitting.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.loginForm.controls.password.reset();

                    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

                    if (returnUrl?.startsWith(`/${townhouse.slug}/`) && !returnUrl.startsWith(`/${townhouse.slug}/auth/`)) {
                        void this.router.navigateByUrl(returnUrl);
                        return;
                    }

                    void this.router.navigate(['/', townhouse.slug]);
                },
                error: (error: unknown) => {
                    this.submitError.set(this.getLoginErrorMessage(error));
                },
            });
    }

    private getLoginErrorMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse && error.status === 401) {
            return 'Telefone, e-mail ou senha inválidos.';
        }

        if (error instanceof HttpErrorResponse && error.status === 0) {
            return 'Não foi possível conectar ao servidor. Tente novamente.';
        }

        return 'Não foi possível entrar. Tente novamente.';
    }
}
