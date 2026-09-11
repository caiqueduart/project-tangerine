import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não foi configurado.');
    }

    return {
        secret,
        refreshSecret: process.env.JWT_REFRESH_SECRET || secret,
        audience: process.env.JWT_AUDIENCE || 'project-tangerine-web',
        issuer: process.env.JWT_ISSUER || 'project-tangerine-api',
        ttl: Number(process.env.JWT_TTL || 900),
        refreshTtl: Number(process.env.JWT_REFRESH_TTL || 3600),
    };
});
