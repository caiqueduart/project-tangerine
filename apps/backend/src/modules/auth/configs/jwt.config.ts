import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
    return {
        secret: process.env.JWT_SECRET,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        ttl: Number(process.env.JWT_TTL),
        refreshTtl: Number(process.env.JWT_REFRESH_TTL),
    };
});
