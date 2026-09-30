import { registerAs } from '@nestjs/config';
import { normalizeEnvironment } from '../../../config/environment';

export default registerAs('jwt', () => {
    const environment = normalizeEnvironment(process.env);

    return {
        secret: environment.JWT_SECRET,
        refreshSecret: environment.JWT_REFRESH_SECRET,
        audience: process.env.JWT_AUDIENCE || 'project-tangerine-web',
        issuer: process.env.JWT_ISSUER || 'project-tangerine-api',
        ttl: environment.JWT_TTL,
        refreshTtl: environment.JWT_REFRESH_TTL,
    };
});
