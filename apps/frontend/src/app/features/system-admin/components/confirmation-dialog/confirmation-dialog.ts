import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmationDialogData {
    readonly title: string;
    readonly message: string;
    readonly confirmLabel: string;
    readonly requiredText?: string;
    readonly destructive?: boolean;
}

@Component({
    selector: 'app-confirmation-dialog',
    imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    templateUrl: './confirmation-dialog.html',
    styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
    readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
    readonly confirmation = new FormControl('', { nonNullable: true });

    get canConfirm(): boolean {
        return !this.data.requiredText || this.confirmation.value === this.data.requiredText;
    }
}
