import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { SYSTEM_ADMIN_ROUTES } from '../../../core/config/routes/system-admin-routes.config';
import { LabelComponent } from '../../../shared/components/label/label.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TownhouseFormDialog } from '../components/townhouse-form-dialog/townhouse-form-dialog';
import { SystemAdminTownhouseListItem } from '../models/admin-townhouse.model';
import { AdminTownhouseService } from '../services/admin-townhouse.service';

@Component({
    selector: 'app-admin-list-townhouses',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        RouterLink,
        LabelComponent,
    ],
    templateUrl: './admin-list-townhouses.html',
    styleUrl: './admin-list-townhouses.scss',
})
export class AdminListTownhouses {
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);
    private readonly _snackbar = inject(SnackbarService);
    private readonly _townhouseService = inject(AdminTownhouseService);

    protected readonly SYSTEM_ADMIN_ROUTES = SYSTEM_ADMIN_ROUTES;

    constructor() {
        this.loadTownhouses();
    }

    readonly townhouses = signal<readonly SystemAdminTownhouseListItem[]>([]);
    readonly loading = signal(true);
    readonly search = signal('');

    readonly filteredTownhouses = computed(() => {
        const search = this.search().trim().toLocaleLowerCase('pt-BR');

        if (!search) {
            return this.townhouses();
        }

        return this.townhouses().filter(
            (townhouse) =>
                townhouse.name.toLocaleLowerCase('pt-BR').includes(search) ||
                townhouse.slug.toLocaleLowerCase('pt-BR').includes(search),
        );
    });

    loadTownhouses(): void {
        this.loading.set(true);

        this._townhouseService.getAll().subscribe({
            next: (townhouses) => {
                this.townhouses.set(townhouses);
                this.loading.set(false);
            },
            error: (error: HttpErrorResponse) => {
                this._snackbar.error(error.message);
                this.loading.set(false);
            },
        });
    }

    updateSearch(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value);
    }

    openCreateDialog(): void {
        this._dialog
            .open(TownhouseFormDialog, { width: '520px', data: {} })
            .afterClosed()
            .subscribe((value) => {
                if (!value) {
                    return;
                }

                this._townhouseService.create(value).subscribe({
                    next: (townhouse) => {
                        this._snackbar.success('Condomínio cadastrado.');
                        void this._router.navigate(SYSTEM_ADMIN_ROUTES.townhouseDetails(townhouse.id));
                    },

                    error: (error: HttpErrorResponse) => {
                        this._snackbar.error(error.message);
                    },
                });
            });
    }
}
