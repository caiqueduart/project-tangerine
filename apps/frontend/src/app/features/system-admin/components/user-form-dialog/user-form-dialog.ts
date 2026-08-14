import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, finalize, of, Subject, switchMap, tap } from 'rxjs';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { AdminUser, AdminUserFormValue, UserSituation } from '../../models/admin-user.model';
import { SystemAdminHouseOption, SystemAdminTownhouseOption } from '../../models/admin-townhouse.model';
import { AdminTownhouseService } from '../../services/admin-townhouse.service';

export interface UserFormDialogData {
    readonly user?: AdminUser;
}

@Component({
    selector: 'app-user-form-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
    templateUrl: './user-form-dialog.html',
    styleUrl: './user-form-dialog.scss',
})
export class UserFormDialog {
    private readonly _data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _dialogRef = inject(MatDialogRef<UserFormDialog, AdminUserFormValue>);
    private readonly _formBuilder = inject(FormBuilder);
    private readonly _snackbar = inject(SnackbarService);
    private readonly _townhouseService = inject(AdminTownhouseService);
    private readonly _townhouseSelection = new Subject<{
        readonly townhouseId: number | null;
        readonly houseId: number | null;
    }>();

    readonly isEditing = Boolean(this._data.user);
    readonly situations: readonly { readonly value: UserSituation; readonly label: string }[] = [
        { value: 'ACTIVE', label: 'Ativo' },
        { value: 'PENDING', label: 'Pendente' },
        { value: 'INACTIVE', label: 'Inativo' },
        { value: 'BLOCKED', label: 'Bloqueado' },
    ];
    readonly townhouses = signal<readonly SystemAdminTownhouseOption[]>([]);
    readonly houses = signal<readonly SystemAdminHouseOption[]>([]);
    readonly loadingTownhouses = signal(true);
    readonly loadingHouses = signal(false);
    readonly form = this._formBuilder.nonNullable.group({
        firstName: [this._data.user?.firstName ?? '', [Validators.required, Validators.maxLength(20)]],
        lastName: [this._data.user?.lastName ?? '', [Validators.required, Validators.maxLength(80)]],
        phone: [this._data.user?.phone ?? '', [Validators.required, Validators.maxLength(20)]],
        email: [this._data.user?.email ?? '', [Validators.email, Validators.maxLength(255)]],
        password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
        situation: [this._data.user?.situation ?? ('ACTIVE' as UserSituation)],
        townhouseId: [this._data.user?.house?.townhouse.id ?? (null as number | null)],
        houseId: [this._data.user?.house?.id ?? (null as number | null)],
    });

    constructor() {
        this._townhouseSelection
            .pipe(
                tap(({ townhouseId, houseId }) => {
                    this.houses.set([]);
                    this.form.controls.houseId.setValue(houseId);
                    this._updateHouseValidators(townhouseId);
                }),
                switchMap(({ townhouseId }) => {
                    if (!townhouseId) {
                        return of([] as SystemAdminHouseOption[]);
                    }

                    this.loadingHouses.set(true);
                    return this._townhouseService.getHouseOptions(townhouseId).pipe(
                        catchError(() => {
                            this._snackbar.error('Não foi possível carregar as casas do condomínio.');
                            return of([] as SystemAdminHouseOption[]);
                        }),
                        finalize(() => this.loadingHouses.set(false)),
                    );
                }),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((houses) => this.houses.set(houses));

        this._loadTownhouses();
    }

    townhouseChanged(townhouseId: number | null): void {
        this._townhouseSelection.next({ townhouseId, houseId: null });
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.getRawValue();
        const result: AdminUserFormValue = {
            firstName: value.firstName.trim(),
            lastName: value.lastName.trim(),
            phone: value.phone.trim(),
            email: value.email.trim().toLowerCase() || null,
            houseId: value.houseId,
            ...(this.isEditing && { situation: value.situation }),
            ...(!this.isEditing && { password: value.password }),
        };

        this._dialogRef.close(result);
    }

    private _loadTownhouses(): void {
        this.loadingTownhouses.set(true);

        this._townhouseService
            .getOptions()
            .pipe(
                finalize(() => this.loadingTownhouses.set(false)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: (townhouses) => {
                    this.townhouses.set(townhouses);

                    const userHouse = this._data.user?.house;
                    if (userHouse) {
                        this._townhouseSelection.next({
                            townhouseId: userHouse.townhouse.id,
                            houseId: userHouse.id,
                        });
                    }
                },
                error: () => this._snackbar.error('Não foi possível carregar os condomínios.'),
            });
    }

    private _updateHouseValidators(townhouseId: number | null): void {
        const houseControl = this.form.controls.houseId;

        if (townhouseId) {
            houseControl.setValidators(Validators.required);
        } else {
            houseControl.clearValidators();
        }

        houseControl.updateValueAndValidity();
    }
}
