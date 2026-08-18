import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não foi configurado.');
    }

    return {
        secret,
        refreshSecret: process.env.JWT_REFRESH_SECRET ?? secret,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        ttl: Number(process.env.JWT_TTL),
        refreshTtl: Number(process.env.JWT_REFRESH_TTL),
    };
});
