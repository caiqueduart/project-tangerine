import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProvisionalPasswordExpiration1791064800000 implements MigrationInterface {
    name = 'AddProvisionalPasswordExpiration1791064800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "provisionalPasswordExpiresAt" TIMESTAMP WITH TIME ZONE`);
        // Usuários já pendentes recebem o prazo padrão a partir da migração, em vez de expirarem imediatamente.
        await queryRunner.query(
            `UPDATE "user" SET "provisionalPasswordExpiresAt" = now() + interval '72 hours' WHERE "situation" = 'PENDING'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provisionalPasswordExpiresAt"`);
    }
}
