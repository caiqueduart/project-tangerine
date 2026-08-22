import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { LabelComponent, LabelTheme } from '../../../shared/components/label/label.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmationDialog, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog';
import { UserDetailsDialog, UserDetailsDialogData } from '../components/user-details-dialog/user-details-dialog';
import { UserFormDialog } from '../components/user-form-dialog/user-form-dialog';
import { AdminUser, UserSituation } from '../models/admin-user.model';
import { AdminUserService } from '../services/admin-user.service';
import {
    ProvisionalPasswordDialog,
    ProvisionalPasswordDialogData,
} from '../components/provisional-password-dialog/provisional-password-dialog';

type UserFilter = 'ALL' | Extract<UserSituation, 'ACTIVE' | 'INACTIVE' | 'PENDING'>;

@Component({
    selector: 'app-admin-list-users',
    imports: [
        LabelComponent,
        MatButtonModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './admin-list-users.html',
    styleUrl: './admin-list-users.scss',
})
export class AdminListUsers {
    private readonly _authSessionService = inject(AuthSessionService);
    private readonly _dialog = inject(MatDialog);
    private readonly _snackbar = inject(SnackbarService);
    private readonly _userService = inject(AdminUserService);

    readonly users = signal<readonly AdminUser[]>([]);
    readonly loading = signal(true);
    readonly regeneratingUserId = signal<string | null>(null);
    readonly search = signal('');
    readonly filter = signal<UserFilter>('ALL');
    readonly pendingCount = computed(() => this.users().filter((user) => user.situation === 'PENDING').length);
    readonly filteredUsers = computed(() => {
        const search = this.search().trim().toLocaleLowerCase('pt-BR');
        const filter = this.filter();

        return this.users().filter((user) => {
            const matchesFilter = filter === 'ALL' || user.situation === filter;
            const searchableValues = [
                user.firstName,
                user.lastName,
                user.email ?? '',
                user.phone,
                user.house?.identifier ?? '',
                user.house?.townhouse.name ?? '',
            ];

            return matchesFilter && searchableValues.some((value) => value.toLocaleLowerCase('pt-BR').includes(search));
        });
    });

    constructor() {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading.set(true);

        this._userService.getAll().subscribe({
            next: (users) => {
                this.users.set(users);
                this.loading.set(false);
            },
            error: (error: HttpErrorResponse) => {
                this._showError(error, 'Não foi possível carregar os usuários.');
                this.loading.set(false);
            },
        });
    }

    updateSearch(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value);
    }

    openForm(user?: AdminUser): void {
        this._dialog
            .open(UserFormDialog, {
                width: '640px',
                maxWidth: 'calc(100vw - 32px)',
                data: { user },
            })
            .afterClosed()
            .subscribe((value) => {
                if (!value) return;

                if (user) {
                    this._userService.update(user.id, value).subscribe({
                        next: () => {
                            this._snackbar.success('Usuário atualizado.');
                            this.loadUsers();
                        },
                        error: (error: HttpErrorResponse) =>
                            this._showError(error, 'Não foi possível atualizar o usuário.'),
                    });
                    return;
                }

                this._userService.create(value).subscribe({
                    next: (createdUser) => {
                        this._snackbar.success('Usuário pré-cadastrado.');
                        this._openProvisionalPasswordDialog(createdUser, createdUser.provisionalPassword);
                        this.loadUsers();
                    },
                    error: (error: HttpErrorResponse) =>
                        this._showError(error, 'Não foi possível cadastrar o usuário.'),
                });
            });
    }

    openDetails(userId: string): void {
        this._dialog.open(UserDetailsDialog, {
            width: '720px',
            maxWidth: 'calc(100vw - 32px)',
            data: { userId } satisfies UserDetailsDialogData,
        });
    }

    regenerateProvisionalPassword(user: AdminUser): void {
        if (this.regeneratingUserId()) {
            return;
        }

        this.regeneratingUserId.set(user.id);

        this._userService
            .regenerateProvisionalPassword(user.id)
            .pipe(finalize(() => this.regeneratingUserId.set(null)))
            .subscribe({
                next: ({ provisionalPassword }) => {
                    this._openProvisionalPasswordDialog(user, provisionalPassword);
                },
                error: (error: HttpErrorResponse) =>
                    this._showError(error, 'Não foi possível gerar uma nova senha provisória.'),
            });
    }

    toggleSituation(user: AdminUser): void {
        const willInactivate = user.situation === 'ACTIVE';
        const data: ConfirmationDialogData = {
            title: willInactivate ? 'Inativar usuário?' : 'Reativar usuário?',
            message: willInactivate
                ? `${user.firstName} perderá o acesso à plataforma, mas seus dados e vínculos serão preservados.`
                : `${user.firstName} voltará a poder acessar a plataforma.`,
            confirmLabel: willInactivate ? 'Inativar' : 'Reativar',
            destructive: willInactivate,
        };

        this._dialog
            .open(ConfirmationDialog, { width: '480px', maxWidth: 'calc(100vw - 32px)', data })
            .afterClosed()
            .subscribe((confirmed) => {
                if (!confirmed) return;

                this._userService.update(user.id, { situation: willInactivate ? 'INACTIVE' : 'ACTIVE' }).subscribe({
                    next: () => {
                        this._snackbar.success(willInactivate ? 'Usuário inativado.' : 'Usuário reativado.');
                        this.loadUsers();
                    },
                    error: (error: HttpErrorResponse) =>
                        this._showError(error, 'Não foi possível alterar a situação do usuário.'),
                });
            });
    }

    isCurrentUser(user: AdminUser): boolean {
        return user.id === this._authSessionService.session()?.user.id;
    }

    statusText(situation: UserSituation): string {
        return { ACTIVE: 'Ativo', BLOCKED: 'Bloqueado', INACTIVE: 'Inativo', PENDING: 'Pendente' }[situation];
    }

    statusTheme(situation: UserSituation): LabelTheme {
        return { ACTIVE: 'green', BLOCKED: 'red', INACTIVE: 'opaque', PENDING: 'orange' }[situation] as LabelTheme;
    }

    statusIcon(situation: UserSituation): string {
        return { ACTIVE: 'check_circle', BLOCKED: 'block', INACTIVE: 'pause_circle', PENDING: 'schedule' }[situation];
    }

    private _showError(error: HttpErrorResponse, fallback: string): void {
        const message = (error.error as { message?: string | string[] } | null)?.message;
        this._snackbar.error(Array.isArray(message) ? message[0] : (message ?? fallback));
    }

    private _openProvisionalPasswordDialog(user: AdminUser, provisionalPassword: string): void {
        const data: ProvisionalPasswordDialogData = {
            userName: `${user.firstName} ${user.lastName}`.trim(),
            phone: user.phone,
            email: user.email,
            provisionalPassword,
        };

        this._dialog.open(ProvisionalPasswordDialog, {
            width: '520px',
            maxWidth: 'calc(100vw - 32px)',
            data,
            disableClose: true,
        });
    }
}
