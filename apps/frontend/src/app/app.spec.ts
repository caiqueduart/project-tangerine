import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';
import { TOWNHOUSE_API_ROUTES } from './core/config/routes/townhouse-routes.config';
import { townhouseContextGuard } from './core/townhouse/townhouse-context.guard';

@Component({ template: '<p>Conteúdo carregado</p>' })
class TestPage {}

describe('Carregamento do sistema', () => {
    const adminReady = new Subject<boolean>();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([
                    { path: 'admin', component: TestPage, canActivate: [() => adminReady] },
                    { path: ':townhouseSlug', component: TestPage, canActivate: [townhouseContextGuard] },
                ]),
            ],
        });
    });

    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('mantém o carregamento do sistema durante a consulta do condomínio e revela a rota após a resposta', async () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Carregando o sistema');
        expect(fixture.nativeElement.querySelector('.system-loading__skeleton')).toBeNull();

        const navigation = TestBed.inject(Router).navigateByUrl('/corumba-ii');
        const request = await vi.waitFor(() =>
            TestBed.inject(HttpTestingController).expectOne(TOWNHOUSE_API_ROUTES.bySlug('corumba-ii')),
        );
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Carregando o sistema');
        expect(fixture.nativeElement.querySelector('.system-loading__spinner')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.system-loading__skeleton')).toBeNull();

        request.flush({ id: 2, name: 'Corumbá II', slug: 'corumba-ii' });
        await navigation;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.system-loading')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Conteúdo carregado');
    });

    it('mantém a tela visível sem loading global durante consultas de navegações posteriores', async () => {
        const fixture = TestBed.createComponent(App);
        const router = TestBed.inject(Router);
        const http = TestBed.inject(HttpTestingController);
        const initialNavigation = router.navigateByUrl('/corumba-ii');
        const initialRequest = await vi.waitFor(() => http.expectOne(TOWNHOUSE_API_ROUTES.bySlug('corumba-ii')));
        initialRequest.flush({ id: 2, name: 'Corumbá II', slug: 'corumba-ii' });
        await initialNavigation;

        const nextNavigation = router.navigateByUrl('/outro-condominio');
        const nextRequest = await vi.waitFor(() => http.expectOne(TOWNHOUSE_API_ROUTES.bySlug('outro-condominio')));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-system-loading')).toBeNull();
        expect(fixture.nativeElement.querySelector('[hidden]')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Conteúdo carregado');

        nextRequest.flush(null, { status: 503, statusText: 'Serviço indisponível' });
        await nextNavigation;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('app-system-loading')).toBeNull();
    });

    it('mantém o carregamento inicial sem skeleton no painel administrativo', async () => {
        const fixture = TestBed.createComponent(App);
        const navigation = TestBed.inject(Router).navigateByUrl('/admin');
        await vi.waitFor(() => expect(adminReady.observed).toBe(true));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Carregando o sistema');
        expect(fixture.nativeElement.querySelector('.system-loading__skeleton')).toBeNull();

        adminReady.next(true);
        await navigation;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.system-loading')).toBeNull();
    });
});
