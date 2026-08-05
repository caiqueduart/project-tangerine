import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';
import { LabelComponent } from '../../../shared/components/label/label.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';
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
        MatTabsModule,
        RouterLink,
        LabelComponent,
    ],
    templateUrl: './admin-townhouse-details.html',
    styleUrl: './admin-townhouse-details.scss',
})
export class AdminTownhouseDetails {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);
    private readonly _snackbar = inject(SnackbarService);
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

    private _showError(error: HttpErrorResponse, fallback: string): void {
        this._snackbar.error(this._getErrorMessage(error, fallback));
    }

    private _getErrorMessage(error: HttpErrorResponse, fallback: string): string {
        const message = (error.error as { message?: string | string[] } | null)?.message;
        return Array.isArray(message) ? message[0] : (message ?? fallback);
    }
}
