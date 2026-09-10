import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, tap } from 'rxjs';
import { AuthSession } from '../../../core/auth/models/auth.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { PasswordPage } from './password-page';

describe('PasswordPage', () => {
    it('conclui o primeiro acesso sem exigir a senha provisória atual', () => {
        const pendingSession = createSession('PENDING');
        const activeSession = createSession('ACTIVE');
        const session = signal<AuthSession | null>(pendingSession);
        const completeFirstAccess = vi
            .fn()
            .mockReturnValue(
                of({ accessToken: 'novo-token', session: activeSession }).pipe(tap(() => session.set(activeSession))),
            );
        const navigate = vi.fn().mockResolvedValue(true);

        TestBed.configureTestingModule({
            providers: [
                FormBuilder,
                { provide: AuthService, useValue: { completeFirstAccess } },
                { provide: AuthSessionService, useValue: { session: session.asReadonly() } },
                { provide: Router, useValue: { navigate } },
                { provide: SnackbarService, useValue: { success: vi.fn(), error: vi.fn() } },
            ],
        });
        const page = TestBed.runInInjectionContext(() => new PasswordPage());
        page.form.patchValue({ newPassword: 'SenhaNova9', confirmPassword: 'SenhaNova9' });

        page.submit();

        expect(completeFirstAccess).toHaveBeenCalledWith({ newPassword: 'SenhaNova9' });
        expect(navigate).toHaveBeenCalledWith(['/', 'corumba-ii']);
    });
});

function createSession(situation: AuthSession['user']['situation']): AuthSession {
    return {
        user: { id: 'user-id', firstName: 'Ana', lastName: 'Silva', role: UserRole.USER, situation },
        house: {
            id: 7,
            identifier: 'Casa 7',
            townhouse: { id: 2, name: 'Condomínio Corumbá II', slug: 'corumba-ii' },
        },
        managerPermissions: [],
    };
}
