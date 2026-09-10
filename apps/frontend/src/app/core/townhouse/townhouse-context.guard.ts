import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { APP_ROUTES } from '../config/routes/app-routes.config';
import { TOWNHOUSE_PARAMS } from '../config/routes/townhouse-routes.config';
import { TownhouseContextService } from './townhouse-context.service';

export const townhouseContextGuard: CanActivateFn = (route) => {
    const slug = route.paramMap.get(TOWNHOUSE_PARAMS.slug);

    if (!slug) {
        return inject(Router).createUrlTree(APP_ROUTES.notFound);
    }

    return inject(TownhouseContextService)
        .loadBySlug(slug)
        .pipe(map(() => true));
};
