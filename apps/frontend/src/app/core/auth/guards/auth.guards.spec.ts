import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    convertToParamMap,
    provideRouter,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { TownhouseContextService } from '../../townhouse/townhouse-context.service';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { AuthSession } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';

describe('guards de autenticação', () => {
    const townhouse = signal({ id: 2, name: 'Condomínio Corumbá II', slug: 'corumba-ii', subtitle: 'Gestão' });
    const session = signal<AuthSession | null>(null);
    const authService = {
        logout: vi.fn(),
        refreshAccessToken: vi.fn(),
    };
    const authSessionService = {
        session: session.asReadonly(),
        townhouseSlug: 'corumba-ii',
        hasValidAccessToken: vi.fn(),
    };

    let router: Router;

    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authService },
                { provide: AuthSessionService, useValue: authSessionService },
                {
                    provide: TownhouseContextService,
                    useValue: { currentTownhouse: townhouse.asReadonly() },
                },
            ],
        });
        router = TestBed.inject(Router);
    });

    it('libera a área administrativa somente para o administrador do sistema', () => {
        session.set(createSession(UserRole.SYSTEM_ADMIN));

        expect(runGuard(adminGuard, createRoute(), '/admin')).toBe(true);

        session.set(createSession(UserRole.USER));
        expect(router.serializeUrl(runGuard(adminGuard, createRoute(), '/admin') as UrlTree)).toBe('/corumba-ii');
    });

    it('libera o contexto residencial com access token válido', () => {
        session.set(createSession(UserRole.USER));
        authSessionService.hasValidAccessToken.mockReturnValue(true);

        expect(runGuard(authGuard, createRoute('corumba-ii'), '/corumba-ii')).toBe(true);
    });

    it('limpa a sessão e retorna ao login quando o refresh falha', async () => {
        session.set(createSession(UserRole.USER));
        authSessionService.hasValidAccessToken.mockReturnValue(false);
        authService.refreshAccessToken.mockReturnValue(throwError(() => new Error('refresh inválido')));

        const result = runGuard(authGuard, createRoute('corumba-ii'), '/corumba-ii');
        const redirect = await firstValueFrom(result as Observable<boolean | UrlTree>);

        expect(authService.logout).toHaveBeenCalledOnce();
        expect(router.serializeUrl(redirect as UrlTree)).toBe('/corumba-ii/auth/login?returnUrl=%2Fcorumba-ii');
    });
});

function runGuard(guard: typeof adminGuard, route: ActivatedRouteSnapshot, url: string): ReturnType<typeof adminGuard> {
    return TestBed.runInInjectionContext(() => guard(route, { url } as RouterStateSnapshot));
}

function createRoute(townhouseSlug?: string): ActivatedRouteSnapshot {
    return {
        paramMap: convertToParamMap(townhouseSlug ? { townhouseSlug } : {}),
        parent: null,
    } as ActivatedRouteSnapshot;
}

function createSession(role: UserRole): AuthSession {
    return {
        user: { id: 'user-id', firstName: 'Ana', lastName: 'Silva', role, situation: 'ACTIVE' },
        house: {
            id: 7,
            identifier: 'Casa 7',
            townhouse: { id: 2, name: 'Condomínio Corumbá II', slug: 'corumba-ii' },
        },
        managerPermissions: [],
    };
}
