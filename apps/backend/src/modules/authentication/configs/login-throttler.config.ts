import type { ThrottlerModuleOptions } from '@nestjs/throttler';

const ONE_MINUTE = 60_000;

// Aplicado somente ao login. Limita tentativas por identificador (força bruta numa conta) e por IP (varredura de contas).
export const loginThrottlerOptions: ThrottlerModuleOptions = {
    errorMessage: 'Muitas tentativas de acesso. Aguarde um minuto e tente novamente.',
    throttlers: [
        {
            name: 'login-identifier',
            ttl: ONE_MINUTE,
            limit: 5,
            getTracker: (request: Record<string, unknown>) => {
                const body = request.body as { uid?: unknown } | undefined;
                const identifier = typeof body?.uid === 'string' ? body.uid.trim().toLowerCase() : '';

                return `${String(request.ip)}:${identifier}`;
            },
        },
        {
            name: 'login-ip',
            ttl: ONE_MINUTE,
            limit: 20,
        },
    ],
};
