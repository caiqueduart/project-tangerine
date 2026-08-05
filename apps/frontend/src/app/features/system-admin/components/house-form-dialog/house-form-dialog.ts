import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface HouseFormDialogData {
    readonly identifier?: string;
}

export interface HouseFormDialogResult {
    readonly identifiers: readonly string[];
}

@Component({
    selector: 'app-house-form-dialog',
    imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    templateUrl: './house-form-dialog.html',
    styleUrl: './house-form-dialog.scss',
})
export class HouseFormDialog {
    private readonly _data = inject<HouseFormDialogData>(MAT_DIALOG_DATA);
    private readonly _dialogRef = inject(MatDialogRef<HouseFormDialog, HouseFormDialogResult>);
    private readonly _formBuilder = inject(FormBuilder);

    readonly isEditing = Boolean(this._data.identifier);
    readonly form = this._formBuilder.nonNullable.group({
        identifiers: [this._data.identifier ?? '', Validators.required],
    });

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const identifiers = this.form.controls.identifiers.value
            .split(/\r?\n/)
            .map((identifier) => identifier.trim())
            .filter(Boolean);

        if (identifiers.length === 0 || identifiers.some((identifier) => identifier.length > 50)) {
            this.form.controls.identifiers.setErrors({ invalidIdentifiers: true });
            return;
        }

        this._dialogRef.close({ identifiers });
    }
}
