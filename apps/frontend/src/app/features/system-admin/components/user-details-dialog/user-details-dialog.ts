import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { LabelComponent, LabelTheme } from '../../../../shared/components/label/label.component';
import { UserRole, USER_ROLE_LABELS } from '../../../../shared/enums/user-role.enum';
import { AdminUserAudit, AdminUserDetails, UserAuditAction, UserSituation } from '../../models/admin-user.model';
import { AdminUserService } from '../../services/admin-user.service';

export interface UserDetailsDialogData {
    readonly userId: string;
}

@Component({
    selector: 'app-user-details-dialog',
    imports: [DatePipe, LabelComponent, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
    templateUrl: './user-details-dialog.html',
    styleUrl: './user-details-dialog.scss',
})
export class UserDetailsDialog {
    private readonly _data = inject<UserDetailsDialogData>(MAT_DIALOG_DATA);
    private readonly _userService = inject(AdminUserService);

    readonly user = signal<AdminUserDetails | null>(null);
    readonly loading = signal(true);
    readonly failed = signal(false);

    constructor() {
        this._userService
            .getDetails(this._data.userId)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (user) => this.user.set(user),
                error: () => this.failed.set(true),
            });
    }

    actorName(audit: AdminUserAudit): string {
        if (!audit.actor) {
            return audit.actorUserId ? 'Responsável não disponível' : 'O próprio usuário';
        }

        return `${audit.actor.firstName} ${audit.actor.lastName}`.trim();
    }

    auditText(action: UserAuditAction): string {
        return {
            CREATED: 'criou o cadastro',
            REGISTRATION_REQUESTED: 'solicitou cadastro',
            UPDATED: 'atualizou o usuário',
            APPROVED: 'aprovou o cadastro',
            PASSWORD_CHANGED: 'alterou a senha',
            ACTIVATED: 'ativou o acesso no primeiro login',
            MANAGER_PERMISSION_GRANTED: 'concedeu uma permissão de gestor',
            MANAGER_PERMISSION_REVOKED: 'removeu uma permissão de gestor',
        }[action];
    }

    roleText(role: UserRole): string {
        return USER_ROLE_LABELS[role];
    }

    statusText(situation: UserSituation): string {
        return { ACTIVE: 'Ativo', BLOCKED: 'Bloqueado', INACTIVE: 'Inativo', PENDING: 'Pendente' }[situation];
    }

    statusTheme(situation: UserSituation): LabelTheme {
        return { ACTIVE: 'green', BLOCKED: 'red', INACTIVE: 'opaque', PENDING: 'orange' }[situation] as LabelTheme;
    }

    statusIcon(situation: UserSituation): string {
        return { ACTIVE: 'check_circle', BLOCKED: 'block', INACTIVE: 'pause_circle', PENDING: 'schedule' }[situation];
    }
}
