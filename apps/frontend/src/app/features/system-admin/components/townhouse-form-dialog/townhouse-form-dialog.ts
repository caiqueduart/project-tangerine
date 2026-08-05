import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SystemAdminTownhouseListItem, TownhouseFormValue } from '../../models/admin-townhouse.model';

export interface TownhouseFormDialogData {
    readonly townhouse?: Pick<SystemAdminTownhouseListItem, 'name' | 'slug'>;
}

@Component({
    selector: 'app-townhouse-form-dialog',
    imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    templateUrl: './townhouse-form-dialog.html',
    styleUrl: './townhouse-form-dialog.scss',
})
export class TownhouseFormDialog {
    private readonly _dialogRef = inject(MatDialogRef<TownhouseFormDialog, TownhouseFormValue>);
    private readonly _data = inject<TownhouseFormDialogData>(MAT_DIALOG_DATA);
    private readonly _formBuilder = inject(FormBuilder);
    private _slugWasEdited = Boolean(this._data.townhouse);

    readonly isEditing = Boolean(this._data.townhouse);
    readonly form = this._formBuilder.nonNullable.group({
        name: [this._data.townhouse?.name ?? '', [Validators.required, Validators.maxLength(100)]],
        slug: [
            this._data.townhouse?.slug ?? '',
            [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)],
        ],
    });

    updateSuggestedSlug(): void {
        if (this._slugWasEdited) {
            return;
        }

        this.form.controls.slug.setValue(this._toSlug(this.form.controls.name.value));
    }

    markSlugAsEdited(): void {
        this._slugWasEdited = true;
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.getRawValue();
        this._dialogRef.close({ name: value.name.trim(), slug: value.slug.trim().toLowerCase() });
    }

    private _toSlug(value: string): string {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 30);
    }
}
