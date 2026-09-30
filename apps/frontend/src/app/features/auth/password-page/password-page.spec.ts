import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject, tap } from 'rxjs';
import { AuthSession } from '../../../core/auth/models/auth.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthSessionService } from '../../../core/auth/services/auth-session.service';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { PasswordPage } from './password-page';

describe('PasswordPage', () => {
    it('mantém a saudação e oculta a senha atual quando a sessão é ativada antes da navegação', () => {
        const session = signal<AuthSession | null>(createSession('PENDING'));
        const response = new Subject<void>();
        const completeFirstAccess = vi
            .fn()
            .mockReturnValue(response.pipe(tap(() => session.set(createSession('ACTIVE')))));
        const navigate = vi.fn().mockReturnValue(new Promise<boolean>(() => undefined));
        const fixture = createPage(session, { completeFirstAccess }, navigate);
        const element: HTMLElement = fixture.nativeElement;

        expect(element.querySelector('h1')?.textContent).toContain('Olá, Ana! Boas-vindas ao Condomínio Corumbá II.');
        expect(element.textContent).toContain('Para concluir seu primeiro acesso, crie uma nova senha.');
        expect(element.querySelector('[formControlName="currentPassword"]')).toBeNull();

        fixture.componentInstance.form.patchValue({ newPassword: 'SenhaNova9', confirmPassword: 'SenhaNova9' });
        fixture.componentInstance.submit();
        response.next();
        response.complete();
        fixture.detectChanges();

        expect(session()?.user.situation).toBe('ACTIVE');
        expect(navigate).toHaveBeenCalledWith(['/', 'corumba-ii']);
        expect(element.querySelector('[formControlName="currentPassword"]')).toBeNull();
        expect(element.querySelector('h1')?.textContent).toContain('Olá, Ana!');
        expect(element.textContent).toContain('Salvar senha e entrar');
    });

    it('dá boas-vindas ao Tangerine quando não há condomínio vinculado', () => {
        const session = signal<AuthSession | null>({ ...createSession('PENDING'), house: null });
        const fixture = createPage(session);

        expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Olá, Ana! Boas-vindas ao Tangerine.');
    });

    it('continua exigindo a senha atual para usuários que já concluíram o primeiro acesso', () => {
        const session = signal<AuthSession | null>(createSession('ACTIVE'));
        const changePassword = vi.fn().mockReturnValue(of(undefined));
        const fixture = createPage(session, { changePassword });
        const page = fixture.componentInstance;

        expect(fixture.nativeElement.querySelector('[formControlName="currentPassword"]')).not.toBeNull();
        page.form.patchValue({ newPassword: 'SenhaNova9', confirmPassword: 'SenhaNova9' });
        page.submit();
        expect(changePassword).not.toHaveBeenCalled();

        page.form.controls.currentPassword.setValue('SenhaAtual8');
        page.submit();
        expect(changePassword).toHaveBeenCalledWith({ currentPassword: 'SenhaAtual8', newPassword: 'SenhaNova9' });
    });

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

function createPage(
    session: ReturnType<typeof signal<AuthSession | null>>,
    authService = {},
    navigate = vi.fn().mockResolvedValue(true),
) {
    TestBed.configureTestingModule({
        imports: [PasswordPage],
        providers: [
            { provide: AuthService, useValue: authService },
            { provide: AuthSessionService, useValue: { session: session.asReadonly() } },
            { provide: Router, useValue: { navigate } },
            { provide: SnackbarService, useValue: { success: vi.fn(), error: vi.fn() } },
        ],
    });
    const fixture = TestBed.createComponent(PasswordPage);
    fixture.detectChanges();
    return fixture;
}

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
