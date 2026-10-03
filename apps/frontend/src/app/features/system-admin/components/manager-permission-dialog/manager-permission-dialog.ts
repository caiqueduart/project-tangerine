import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    of,
    startWith,
    switchMap,
    tap,
} from 'rxjs';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { AdminUser } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';

export interface ManagerPermissionDialogData {
    readonly excludedUserIds: readonly string[];
}

const SEARCH_PAGE_SIZE = 20;

function selectedUserValidator(control: AbstractControl<string | AdminUser>): ValidationErrors | null {
    return typeof control.value === 'string' ? { required: true } : null;
}

@Component({
    selector: 'app-manager-permission-dialog',
    imports: [
        MatAutocompleteModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    templateUrl: './manager-permission-dialog.html',
    styleUrl: './manager-permission-dialog.scss',
})
export class ManagerPermissionDialog {
    private readonly _data = inject<ManagerPermissionDialogData>(MAT_DIALOG_DATA);
    private readonly _dialogRef = inject(MatDialogRef<ManagerPermissionDialog, string>);
    private readonly _snackbar = inject(SnackbarService);
    private readonly _userService = inject(AdminUserService);
    private readonly _excludedUserIds = new Set(this._data.excludedUserIds);

    readonly userControl = new FormControl<string | AdminUser>('', {
        nonNullable: true,
        validators: selectedUserValidator,
    });
    readonly form = new FormGroup({ user: this.userControl });
    readonly candidates = signal<readonly AdminUser[]>([]);
    readonly searching = signal(false);

    constructor() {
        // Busca paginada no servidor: a lista não depende de carregar todos os usuários ativos.
        this.userControl.valueChanges
            .pipe(
                startWith(this.userControl.value),
                filter((value): value is string => typeof value === 'string'),
                map((search) => search.trim()),
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => this.searching.set(true)),
                switchMap((search) =>
                    this._userService
                        .getAll({
                            page: 1,
                            pageSize: SEARCH_PAGE_SIZE,
                            situation: 'ACTIVE',
                            search: search || undefined,
                        })
                        .pipe(
                            map(({ items }) => items.filter((user) => !this._excludedUserIds.has(user.id))),
                            catchError(() => {
                                this._snackbar.error('Não foi possível buscar os usuários.');
                                return of([] as AdminUser[]);
                            }),
                            finalize(() => this.searching.set(false)),
                        ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((users) => this.candidates.set(users));
    }

    displayUser(user: string | AdminUser | null): string {
        if (!user) return '';
        return typeof user === 'string' ? user : `${user.firstName} ${user.lastName}`.trim();
    }

    submit(): void {
        const user = this.userControl.value;

        if (typeof user === 'string') {
            this.userControl.markAsTouched();
            return;
        }

        this._dialogRef.close(user.id);
    }
}
