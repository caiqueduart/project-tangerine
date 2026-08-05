import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';
import { ConfirmationDialog, ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog';
import { HouseFormDialog, HouseFormDialogData } from '../components/house-form-dialog/house-form-dialog';
import { TownhouseFormDialog } from '../components/townhouse-form-dialog/townhouse-form-dialog';
import {
    SystemAdminHouse,
    SystemAdminTownhouseDetails as SystemAdminTownhouseDetailsModel,
} from '../models/admin-townhouse.model';
import { AdminTownhouseService } from '../services/admin-townhouse.service';

@Component({
    selector: 'app-admin-townhouse-details',
    imports: [
        DatePipe,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTabsModule,
        RouterLink,
    ],
    templateUrl: './admin-townhouse-details.html',
    styleUrl: './admin-townhouse-details.scss',
})
export class AdminTownhouseDetails {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);
    private readonly _snackBar = inject(MatSnackBar);
    private readonly _townhouseService = inject(AdminTownhouseService);
    private readonly _townhouseId = Number(this._activatedRoute.snapshot.paramMap.get('townhouseId'));

    readonly townhouse = signal<SystemAdminTownhouseDetailsModel | null>(null);
    readonly loading = signal(true);
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
                        this._snackBar.open('Condomínio atualizado.', 'Fechar', { duration: 3500 });
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
                            this._snackBar.open(
                                willInactivate ? 'Condomínio inativado.' : 'Condomínio ativado.',
                                'Fechar',
                                {
                                    duration: 3500,
                                },
                            );
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
                        this._snackBar.open('Condomínio excluído.', 'Fechar', { duration: 3500 });
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
                            this._snackBar.open(
                                result.identifiers.length === 1
                                    ? 'Casa adicionada.'
                                    : `${result.identifiers.length} casas adicionadas.`,
                                'Fechar',
                                { duration: 3500 },
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
                        this._snackBar.open('Casa atualizada.', 'Fechar', { duration: 3500 });
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
                        this._snackBar.open('Casa excluída.', 'Fechar', { duration: 3500 });
                        this.loadTownhouse();
                    },
                    error: (error: HttpErrorResponse) => this._showError(error, 'Não foi possível excluir a casa.'),
                });
            });
    }

    private _showError(error: HttpErrorResponse, fallback: string): void {
        this._snackBar.open(this._getErrorMessage(error, fallback), 'Fechar', { duration: 5000 });
    }

    private _getErrorMessage(error: HttpErrorResponse, fallback: string): string {
        const message = (error.error as { message?: string | string[] } | null)?.message;
        return Array.isArray(message) ? message[0] : (message ?? fallback);
    }
}
