import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarLabel, MatSnackBarRef } from '@angular/material/snack-bar';

export type SnackbarType = 'error' | 'info' | 'success' | 'warning';

export interface SnackbarData {
    readonly actionLabel?: string;
    readonly duration: number;
    readonly message: string;
    readonly type: SnackbarType;
}

@Component({
    selector: 'app-snackbar',
    imports: [MatButtonModule, MatIconModule, MatSnackBarAction, MatSnackBarLabel],
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
    readonly snackbarRef = inject(MatSnackBarRef<SnackbarComponent>);
    readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
}
