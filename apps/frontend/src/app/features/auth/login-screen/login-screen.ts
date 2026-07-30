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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { TownhouseContextService } from '../../../core/townhouse/townhouse-context.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
    selector: 'app-login-screen',
    imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule],
    templateUrl: './login-screen.html',
    styleUrl: './login-screen.scss',
})
export class LoginScreen {
    private readonly townhouseContextService = inject(TownhouseContextService);
    private readonly authService = inject(AuthService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    passwordVisible = false;
    readonly townhouse = this.townhouseContextService.currentTownhouse;
    readonly townhouseError = this.townhouseContextService.error;
    readonly submitting = signal(false);
    readonly submitError = signal<string | null>(null);

    readonly loginForm = new FormGroup({
        identifier: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        password: new FormControl('', {
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

                    this.snackBar.open('Login realizado com sucesso.', 'Fechar', {
                        duration: 3000,
                    });

                    // TODO: redirecionar para a tela inicial do condomínio quando essa rota for implementada.
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
