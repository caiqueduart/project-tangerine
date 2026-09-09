import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AdminUser } from '../../models/admin-user.model';

export interface ManagerPermissionDialogData {
    readonly users: readonly AdminUser[];
}

@Component({
    selector: 'app-manager-permission-dialog',
    imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
    templateUrl: './manager-permission-dialog.html',
    styleUrl: './manager-permission-dialog.scss',
})
export class ManagerPermissionDialog {
    private readonly _data = inject<ManagerPermissionDialogData>(MAT_DIALOG_DATA);
    private readonly _dialogRef = inject(MatDialogRef<ManagerPermissionDialog, string>);
    private readonly _formBuilder = inject(FormBuilder);

    readonly users = this._data.users;
    readonly form = this._formBuilder.nonNullable.group({
        userId: ['', Validators.required],
    });

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this._dialogRef.close(this.form.controls.userId.value);
    }
}
