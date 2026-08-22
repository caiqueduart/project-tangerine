import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../../../shared/services/snackbar.service';

export interface ProvisionalPasswordDialogData {
    readonly userName: string;
    readonly phone: string;
    readonly email: string | null;
    readonly provisionalPassword: string;
}

@Component({
    selector: 'app-provisional-password-dialog',
    imports: [MatButtonModule, MatDialogModule, MatIconModule],
    templateUrl: './provisional-password-dialog.html',
    styleUrl: './provisional-password-dialog.scss',
})
export class ProvisionalPasswordDialog {
    private readonly _clipboard = inject(Clipboard);
    private readonly _snackbar = inject(SnackbarService);

    readonly data = inject<ProvisionalPasswordDialogData>(MAT_DIALOG_DATA);

    copyCredentials(): void {
        const email = this.data.email ? `\nE-mail: ${this.data.email}` : '';
        const content = [
            'Seu acesso ao Tangerine foi criado.',
            `Telefone: ${this.data.phone}${email}`,
            `Senha provisória: ${this.data.provisionalPassword}`,
            'No primeiro acesso, você deverá criar uma nova senha.',
        ].join('\n');

        if (this._clipboard.copy(content)) {
            this._snackbar.success('Dados de acesso copiados.');
            return;
        }

        this._snackbar.error('Não foi possível copiar os dados de acesso.');
    }
}
