import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarComponent, SnackbarType } from '../components/snackbar/snackbar.component';

export interface SnackbarOptions {
    readonly actionLabel?: string;
    readonly duration?: number;
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private readonly _snackbar = inject(MatSnackBar);
    private readonly _defaultDuration = 6000;

    error(message: string, options?: SnackbarOptions): MatSnackBarRef<SnackbarComponent> {
        return this._open(message, 'error', options);
    }

    info(message: string, options?: SnackbarOptions): MatSnackBarRef<SnackbarComponent> {
        return this._open(message, 'info', options);
    }

    success(message: string, options?: SnackbarOptions): MatSnackBarRef<SnackbarComponent> {
        return this._open(message, 'success', options);
    }

    warning(message: string, options?: SnackbarOptions): MatSnackBarRef<SnackbarComponent> {
        return this._open(message, 'warning', options);
    }

    private _open(
        message: string,
        type: SnackbarType = 'info',
        options: SnackbarOptions = {},
    ): MatSnackBarRef<SnackbarComponent> {
        const duration = options.duration ?? this._defaultDuration;

        return this._snackbar.openFromComponent(SnackbarComponent, {
            panelClass: ['app-snackbar', `app-snackbar--${type}`],
            data: { message, type, actionLabel: options.actionLabel, duration },
            verticalPosition: 'top',
            horizontalPosition: 'end',
            duration,
        });
    }
}
