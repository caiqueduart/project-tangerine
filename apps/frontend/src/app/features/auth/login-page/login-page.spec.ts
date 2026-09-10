import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthSession } from '../../../core/auth/models/auth.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { TownhouseContextService } from '../../../core/townhouse/townhouse-context.service';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { LoginPage } from './login-page';
import { LOGIN_PAGE_ROUTE_DATA_KEY, TOWNHOUSE_LOGIN_PAGE_CONFIG } from './login-page.config';

describe('LoginPage', () => {
    it('envia credenciais normalizadas com o condomínio atual', () => {
        const session = signal<AuthSession | null>(createSession());
        const login = vi.fn().mockReturnValue(of({ accessToken: 'token', session: session() }));
        const navigate = vi.fn().mockResolvedValue(true);
        const router = {
            navigate,
            createUrlTree: vi.fn((commands: readonly unknown[]) => commands),
            serializeUrl: vi.fn(() => '/rota'),
        };
        const townhouse = signal({ id: 2, name: 'Condomínio Corumbá II', slug: 'corumba-ii', subtitle: 'Gestão' });

        TestBed.configureTestingModule({
            providers: [
                FormBuilder,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            data: { [LOGIN_PAGE_ROUTE_DATA_KEY]: TOWNHOUSE_LOGIN_PAGE_CONFIG },
                            queryParamMap: convertToParamMap({}),
                        },
                    },
                },
                { provide: AuthService, useValue: { login } },
                { provide: AuthSessionService, useValue: { session: session.asReadonly() } },
                { provide: Router, useValue: router },
                { provide: SnackbarService, useValue: { error: vi.fn() } },
                {
                    provide: TownhouseContextService,
                    useValue: { currentTownhouse: townhouse.asReadonly(), error: signal(null).asReadonly() },
                },
            ],
        });
        const page = TestBed.runInInjectionContext(() => new LoginPage());
        page.loginForm.setValue({ identifier: '  ana@email.com  ', password: 'Senha123' });

        page.submit();

        expect(login).toHaveBeenCalledWith({ uid: 'ana@email.com', password: 'Senha123' }, 'corumba-ii');
        expect(navigate).toHaveBeenCalledWith(['/', 'corumba-ii']);
    });
});

function createSession(): AuthSession {
    return {
        user: {
            id: 'user-id',
            firstName: 'Ana',
            lastName: 'Silva',
            role: UserRole.USER,
            situation: 'ACTIVE',
        },
        house: {
            id: 7,
            identifier: 'Casa 7',
            townhouse: { id: 2, name: 'Condomínio Corumbá II', slug: 'corumba-ii' },
        },
        managerPermissions: [],
    };
}
