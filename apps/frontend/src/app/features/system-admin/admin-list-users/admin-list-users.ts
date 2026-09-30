import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
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
        MatPaginatorModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './admin-list-users.html',
    styleUrl: './admin-list-users.scss',
})
export class AdminListUsers {
    private readonly _authSessionService = inject(AuthSessionService);
    private readonly _dialog = inject(MatDialog);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _snackbar = inject(SnackbarService);
    private readonly _userService = inject(AdminUserService);

    readonly users = signal<readonly AdminUser[]>([]);
    readonly loading = signal(true);
    readonly regeneratingUserId = signal<string | null>(null);
    readonly search = signal('');
    readonly filter = signal<UserFilter>('ALL');
    readonly total = signal(0);
    readonly totalUsers = signal(0);
    readonly pendingCount = signal(0);
    readonly pageIndex = signal(0);
    readonly pageSize = signal(10);
    private readonly _searchChanges = new Subject<string>();

    constructor() {
        this._searchChanges
            .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
            .subscribe((search) => {
                this.search.set(search);
                this.pageIndex.set(0);
                this.loadUsers();
            });
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading.set(true);

        const filter = this.filter();
        const situation: UserSituation | undefined = filter === 'ALL' ? undefined : filter;
        this._userService
            .getAll({
                page: this.pageIndex() + 1,
                pageSize: this.pageSize(),
                search: this.search() || undefined,
                situation,
            })
            .subscribe({
                next: (response) => {
                    this.users.set(response.items);
                    this.total.set(response.total);
                    this.totalUsers.set(response.totalUsers);
                    this.pendingCount.set(response.pendingCount);
                    this.loading.set(false);
                },
                error: (error: HttpErrorResponse) => {
                    this._showError(error, 'Não foi possível carregar os usuários.');
                    this.loading.set(false);
                },
            });
    }

    updateSearch(event: Event): void {
        this._searchChanges.next((event.target as HTMLInputElement).value.trim());
    }

    updateFilter(filter: UserFilter): void {
        this.filter.set(filter);
        this.pageIndex.set(0);
        this.loadUsers();
    }

    updatePage(event: PageEvent): void {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.loadUsers();
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
