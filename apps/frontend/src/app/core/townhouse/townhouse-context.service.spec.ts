import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TOWNHOUSE_API_ROUTES } from '../config/routes/townhouse-routes.config';
import { TownhouseContextService } from './townhouse-context.service';

describe('TownhouseContextService', () => {
    let service: TownhouseContextService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(TownhouseContextService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        vi.useRealTimers();
    });

    it('encerra a espera após 15 segundos e permite uma nova consulta', () => {
        vi.useFakeTimers();
        expect(service.loading()).toBe(false);
        service.loadBySlug('corumba-ii').subscribe();
        const stalledRequest = http.expectOne(TOWNHOUSE_API_ROUTES.bySlug('corumba-ii'));
        expect(service.loading()).toBe(true);

        vi.advanceTimersByTime(15_000);
        expect(stalledRequest.cancelled).toBe(true);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBe('unavailable');

        service.loadBySlug('corumba-ii').subscribe();
        expect(service.error()).toBeNull();
        http.expectOne(TOWNHOUSE_API_ROUTES.bySlug('corumba-ii')).flush({
            id: 2,
            name: 'Corumbá II',
            slug: 'corumba-ii',
        });
        expect(service.loading()).toBe(false);
        expect(service.currentTownhouse()?.name).toBe('Corumbá II');
    });

    it('encerra o loading quando a navegação cancela a consulta', () => {
        const subscription = service.loadBySlug('corumba-ii').subscribe();
        const request = http.expectOne(TOWNHOUSE_API_ROUTES.bySlug('corumba-ii'));
        subscription.unsubscribe();
        expect(request.cancelled).toBe(true);
        expect(service.loading()).toBe(false);
    });

    it.each([404, 403, 503])('encerra o loading após erro HTTP %s', (status) => {
        service.loadBySlug('corumba-ii').subscribe();
        http.expectOne(TOWNHOUSE_API_ROUTES.bySlug('corumba-ii')).flush(null, { status, statusText: 'Erro' });
        expect(service.loading()).toBe(false);
        expect(service.error()).toBe(status === 404 ? 'not-found' : status === 403 ? 'inactive' : 'unavailable');
    });
});
