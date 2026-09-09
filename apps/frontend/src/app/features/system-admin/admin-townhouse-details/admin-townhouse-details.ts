import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { LabelComponent } from '../../../shared/components/label/label.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfirmationDialog, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog';
import { HouseFormDialog, HouseFormDialogData } from '../components/house-form-dialog/house-form-dialog';
import { TownhouseFormDialog } from '../components/townhouse-form-dialog/townhouse-form-dialog';
import {
    SystemAdminHouse,
    SystemAdminTownhouseDetails as SystemAdminTownhouseDetailsModel,
} from '../models/admin-townhouse.model';
import { AdminUser } from '../models/admin-user.model';
import { AdminTownhouseService } from '../services/admin-townhouse.service';
import { AdminUserService } from '../services/admin-user.service';
import {
    ProvisionalPasswordDialog,
    ProvisionalPasswordDialogData,
} from '../components/provisional-password-dialog/provisional-password-dialog';
import {
    ManagerPermissionDialog,
    ManagerPermissionDialogData,
} from '../components/manager-permission-dialog/manager-permission-dialog';
import { AdminManagerPermission } from '../models/admin-manager-permission.model';
import { AdminManagerPermissionService } from '../services/admin-manager-permission.service';

@Component({
    selector: 'app-admin-townhouse-details',
    imports: [
        DatePipe,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        RouterLink,
        LabelComponent,
    ],
    templateUrl: './admin-townhouse-details.html',
    styleUrl: './admin-townhouse-details.scss',
})
export class AdminTownhouseDetails {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _authSessionService = inject(AuthSessionService);
    private readonly _dialog = inject(MatDialog);
    private readonly _managerPermissionService = inject(AdminManagerPermissionService);
    private readonly _router = inject(Router);
    private readonly _snackbar = inject(SnackbarService);
    private readonly _townhouseService = inject(AdminTownhouseService);
    private readonly _userService = inject(AdminUserService);
    private readonly _townhouseId = Number(this._activatedRoute.snapshot.paramMap.get('townhouseId'));

    readonly townhouse = signal<SystemAdminTownhouseDetailsModel | null>(null);
    readonly loading = signal(true);
    readonly loadingManagers = signal(true);
    readonly loadingManagerCandidates = signal(false);
    readonly regeneratingUserId = signal<string | null>(null);
    readonly managers = signal<readonly AdminManagerPermission[]>([]);
    readonly users = signal<readonly AdminUser[]>([]);
    readonly townhousesRoute = SYSTEM_ADMIN_ROUTES.townhouses;

    constructor() {
        this.loadTownhouse();
    }

    loadTownhouse(): void {
        if (!Number.isInteger(this._townhouseId) || this._townhouseId <= 0) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);

        this._townhouseService.getOne(this._townhouseId).subscribe({
            next: (townhouse) => {
                this.townhouse.set(townhouse);
                this.loading.set(false);
                this.loadUsers();
                this.loadManagers();
            },
            error: (error: HttpErrorResponse) => {
                this.loading.set(false);
            },
        });
    }

    openEditDialog(): void {
        const townhouse = this.townhouse();
        if (!townhouse) {
            return;
        }

        this._dialog
            .open(TownhouseFormDialog, {
                width: '520px',
                maxWidth: 'calc(100vw - 32px)',
                data: { townhouse },
            })
            .afterClosed()
            .subscribe((value) => {
                if (!value) {
                    return;
                }

                this._townhouseService.update(townhouse.id, value).subscribe({
                    next: (updatedTownhouse) => {
                        this.townhouse.set(updatedTownhouse);
                        this._snackbar.success('Condomínio atualizado.');
                    },
                    error: (error: HttpErrorResponse) =>
                        this._showError(error, 'Não foi possível atualizar o condomínio.'),
                });
            });
    }

    toggleSituation(): void {
        const townhouse = this.townhouse();
        if (!townhouse) {
            return;
        }

        const willInactivate = townhouse.situation === 'ACTIVE';
        const data: ConfirmationDialogData = {
            title: willInactivate ? 'Inativar condomínio?' : 'Ativar condomínio?',
            message: willInactivate
                ? 'O condomínio continuará cadastrado, mas ficará marcado como inativo.'
                : 'O condomínio voltará a ficar disponível como ativo.',
            confirmLabel: willInactivate ? 'Inativar' : 'Ativar',
        };

        this._dialog
            .open(ConfirmationDialog, { width: '480px', maxWidth: 'calc(100vw - 32px)', data })
            .afterClosed()
            .subscribe((confirmed) => {
                if (!confirmed) {
                    return;
                }

                this._townhouseService
                    .update(townhouse.id, { situation: willInactivate ? 'INACTIVE' : 'ACTIVE' })
                    .subscribe({
                        next: (updatedTownhouse) => {
                            this.townhouse.set(updatedTownhouse);
                            this._snackbar.success(willInactivate ? 'Condomínio inativado.' : 'Condomínio ativado.');
                        },
                        error: (error: HttpErrorResponse) =>
                            this._showError(error, 'Não foi possível alterar a situação do condomínio.'),
                    });
            });
    }

    deleteTownhouse(): void {
        const townhouse = this.townhouse();
        if (!townhouse) {
            return;
        }

        const data: ConfirmationDialogData = {
            title: 'Excluir condomínio?',
            message: 'Esta ação é definitiva. Casas cadastradas precisam ser removidas antes da exclusão.',
            confirmLabel: 'Excluir condomínio',
            requiredText: townhouse.name,
            destructive: true,
        };

        this._dialog
            .open(ConfirmationDialog, { width: '500px', maxWidth: 'calc(100vw - 32px)', data })
            .afterClosed()
            .subscribe((confirmed) => {
                if (!confirmed) {
                    return;
                }

                this._townhouseService.delete(townhouse.id).subscribe({
                    next: () => {
                        this._snackbar.success('Condomínio excluído.');
                        void this._router.navigate(this.townhousesRoute);
                    },
                    error: (error: HttpErrorResponse) =>
                        this._showError(error, 'Não foi possível excluir o condomínio.'),
                });
            });
    }

    addHouses(): void {
        const townhouse = this.townhouse();
        if (!townhouse) {
            return;
        }

        this._dialog
            .open(HouseFormDialog, {
                width: '540px',
                maxWidth: 'calc(100vw - 32px)',
                data: {} satisfies HouseFormDialogData,
            })
            .afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }

                this._townhouseService
                    .createHouses({ townhouseId: townhouse.id, identifiers: result.identifiers })
                    .subscribe({
                        next: () => {
                            this._snackbar.success(
                                result.identifiers.length === 1
                                    ? 'Casa adicionada.'
                                    : `${result.identifiers.length} casas adicionadas.`,
                            );
                            this.loadTownhouse();
                        },
                        error: (error: HttpErrorResponse) =>
                            this._showError(error, 'Não foi possível adicionar as casas.'),
                    });
            });
    }

    editHouse(house: SystemAdminHouse): void {
        const townhouse = this.townhouse();
        if (!townhouse) {
            return;
        }

        this._dialog
            .open(HouseFormDialog, {
                width: '500px',
                maxWidth: 'calc(100vw - 32px)',
                data: { identifier: house.identifier } satisfies HouseFormDialogData,
            })
            .afterClosed()
            .subscribe((result) => {
                const identifier = result?.identifiers[0];
                if (!identifier) {
                    return;
                }

                this._townhouseService.updateHouse(house.id, { townhouseId: townhouse.id, identifier }).subscribe({
                    next: () => {
                        this._snackbar.success('Casa atualizada.');
                        this.loadTownhouse();
                    },
                    error: (error: HttpErrorResponse) => this._showError(error, 'Não foi possível atualizar a casa.'),
                });
            });
    }

    deleteHouse(house: SystemAdminHouse): void {
        const data: ConfirmationDialogData = {
            title: 'Excluir casa?',
            message: `A casa “${house.identifier}” será removida do condomínio.`,
            confirmLabel: 'Excluir casa',
            destructive: true,
        };

        this._dialog
            .open(ConfirmationDialog, { width: '460px', maxWidth: 'calc(100vw - 32px)', data })
            .afterClosed()
            .subscribe((confirmed) => {
                if (!confirmed) {
                    return;
                }

                this._townhouseService.deleteHouse(house.id).subscribe({
                    next: () => {
                        this._snackbar.success('Casa excluída.');
                        this.loadTownhouse();
                    },
                    error: (error: HttpErrorResponse) => this._showError(error, 'Não foi possível excluir a casa.'),
                });
            });
    }

    toggleUserSituation(user: AdminUser): void {
        const willInactivate = user.situation === 'ACTIVE';
        const data: ConfirmationDialogData = {
            title: willInactivate ? 'Inativar usuário?' : 'Reativar usuário?',
            message: willInactivate
                ? `${user.firstName} perderá o acesso à plataforma, mas continuará vinculado a este condomínio.`
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
                },
                error: (error: HttpErrorResponse) =>
                    this._showError(error, 'Não foi possível gerar uma nova senha provisória.'),
            });
    }

    removeUser(user: AdminUser): void {
        const data: ConfirmationDialogData = {
            title: 'Remover do condomínio?',
            message: `${user.firstName} deixará de estar vinculado à casa ${user.house?.identifier}. O cadastro do usuário será preservado.`,
            confirmLabel: 'Remover vínculo',
            destructive: true,
        };

        this._dialog
            .open(ConfirmationDialog, { width: '500px', maxWidth: 'calc(100vw - 32px)', data })
            .afterClosed()
            .subscribe((confirmed) => {
                if (!confirmed) return;

                this._userService.update(user.id, { townhouseId: null, houseId: null }).subscribe({
                    next: () => {
                        this._snackbar.success('Vínculo residencial removido.');
                        this.loadTownhouse();
                    },
                    error: (error: HttpErrorResponse) =>
                        this._showError(error, 'Não foi possível remover o vínculo do usuário.'),
                });
            });
    }

    openAddManagerDialog(): void {
        if (this.loadingManagerCandidates()) return;
        this.loadingManagerCandidates.set(true);

        this._userService
            .getAll()
            .pipe(finalize(() => this.loadingManagerCandidates.set(false)))
            .subscribe({
                next: (users) => {
                    const managerUserIds = new Set(this.managers().map((permission) => permission.userId));
                    const candidates = users.filter(
                        (user) => user.situation === 'ACTIVE' && !managerUserIds.has(user.id),
                    );

                    if (!candidates.length) {
                        this._snackbar.error('Não há usuários ativos disponíveis para receber esta permissão.');
                        return;
                    }

                    this._dialog
                        .open(ManagerPermissionDialog, {
                            width: '540px',
                            maxWidth: 'calc(100vw - 32px)',
                            data: { users: candidates } satisfies ManagerPermissionDialogData,
                        })
                        .afterClosed()
                        .subscribe((userId) => {
                            if (!userId) return;

                            this._managerPermissionService.grant(this._townhouseId, userId).subscribe({
                                next: () => {
                                    this._snackbar.success('Permissão de gestor concedida.');
                                    this.loadManagers();
                                },
                                error: (error: HttpErrorResponse) =>
                                    this._showError(error, 'Não foi possível conceder a permissão de gestor.'),
                            });
                        });
                },
                error: (error: HttpErrorResponse) =>
                    this._showError(error, 'Não foi possível carregar os usuários disponíveis.'),
            });
    }

    removeManager(permission: AdminManagerPermission): void {
        const data: ConfirmationDialogData = {
            title: 'Remover permissão de gestor?',
            message: `${permission.user.firstName} perderá o acesso administrativo a este condomínio. O vínculo residencial será preservado.`,
            confirmLabel: 'Remover permissão',
            destructive: true,
        };

        this._dialog
            .open(ConfirmationDialog, { width: '500px', maxWidth: 'calc(100vw - 32px)', data })
            .afterClosed()
            .subscribe((confirmed) => {
                if (!confirmed) return;

                this._managerPermissionService.revoke(this._townhouseId, permission.userId).subscribe({
                    next: () => {
                        this._snackbar.success('Permissão de gestor removida.');
                        this.loadManagers();
                    },
                    error: (error: HttpErrorResponse) =>
                        this._showError(error, 'Não foi possível remover a permissão de gestor.'),
                });
            });
    }

    isCurrentUser(user: AdminUser): boolean {
        return user.id === this._authSessionService.session()?.user.id;
    }

    private loadUsers(): void {
        this._userService.getAll(this._townhouseId).subscribe({
            next: (users) => this.users.set(users),
            error: (error: HttpErrorResponse) => this._showError(error, 'Não foi possível carregar os usuários.'),
        });
    }

    private loadManagers(): void {
        this.loadingManagers.set(true);

        this._managerPermissionService
            .getActive(this._townhouseId)
            .pipe(finalize(() => this.loadingManagers.set(false)))
            .subscribe({
                next: (managers) => this.managers.set(managers),
                error: (error: HttpErrorResponse) =>
                    this._showError(error, 'Não foi possível carregar os gestores do condomínio.'),
            });
    }

    private _showError(error: HttpErrorResponse, fallback: string): void {
        this._snackbar.error(this._getErrorMessage(error, fallback));
    }

    private _getErrorMessage(error: HttpErrorResponse, fallback: string): string {
        const message = (error.error as { message?: string | string[] } | null)?.message;
        return Array.isArray(message) ? message[0] : (message ?? fallback);
    }
}
