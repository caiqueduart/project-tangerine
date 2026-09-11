import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UserService } from '../../modules/user/user.service';

async function bootstrapSystemAdmin(): Promise<void> {
    const application = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });

    try {
        const config = application.get(ConfigService);

        const value = (name: string) => {
            const configuredValue = config.getOrThrow<string>(name).trim();

            if (!configuredValue) throw new Error(`${name} não foi preenchida.`);
            return configuredValue;
        };

        const result = await application.get(UserService).bootstrapSystemAdmin({
            firstName: value('SYSTEM_ADMIN_FIRST_NAME'),
            lastName: value('SYSTEM_ADMIN_LAST_NAME'),
            phone: value('SYSTEM_ADMIN_PHONE'),
            email: value('SYSTEM_ADMIN_EMAIL'),
            password: value('SYSTEM_ADMIN_PASSWORD'),
        });

        process.stdout.write(`Administrador inicial ${result === 'created' ? 'criado' : 'já existente'}.\n`);
    } finally {
        await application.close();
    }
}

void bootstrapSystemAdmin();
