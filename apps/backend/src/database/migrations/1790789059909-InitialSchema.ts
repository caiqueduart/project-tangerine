import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790789059909 implements MigrationInterface {
    name = 'InitialSchema1790789059909';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "resident" ("userId" uuid NOT NULL, "houseId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9f33f1c7b6d5a56be451d757821" PRIMARY KEY ("userId"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_situation_enum" AS ENUM('ACTIVE', 'BLOCKED', 'INACTIVE', 'PENDING')`,
        );
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'SYSTEM_ADMIN')`);
        await queryRunner.query(
            `CREATE TABLE "user" ("passwordHash" character varying NOT NULL, "id" uuid NOT NULL DEFAULT gen_random_uuid(), "firstName" character varying(20) NOT NULL, "lastName" character varying(80) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255), "situation" "public"."user_situation_enum" NOT NULL DEFAULT 'PENDING', "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."manager_permission_situation_enum" AS ENUM('ACTIVE', 'REVOKED')`,
        );
        await queryRunner.query(
            `CREATE TABLE "ManagerPermissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "townhouseId" integer NOT NULL, "situation" "public"."manager_permission_situation_enum" NOT NULL DEFAULT 'ACTIVE', "grantedByUserId" uuid, "grantedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedByUserId" uuid, "revokedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9c12aaab8365b98367201f29512" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_manager_permission_user_townhouse" ON "ManagerPermissions" ("userId", "townhouseId") `,
        );
        await queryRunner.query(`CREATE TYPE "public"."townhouse_situation_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(
            `CREATE TABLE "townhouse" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(30) NOT NULL, "situation" "public"."townhouse_situation_enum" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1972a9f31bb939e465e7baa1a8b" UNIQUE ("slug"), CONSTRAINT "PK_d4203c18a4a37e66bfdb70ff942" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "house" ("id" SERIAL NOT NULL, "identifier" character varying(50) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "townhouseId" integer NOT NULL, CONSTRAINT "UQ_fefbcdc745cf8a0dc3b4ef99c90" UNIQUE ("townhouseId", "identifier"), CONSTRAINT "PK_8c9220195fd0a289745855fe908" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_audit_action_enum" AS ENUM('CREATED', 'REGISTRATION_REQUESTED', 'UPDATED', 'APPROVED', 'PASSWORD_CHANGED', 'ACTIVATED', 'MANAGER_PERMISSION_GRANTED', 'MANAGER_PERMISSION_REVOKED')`,
        );
        await queryRunner.query(
            `CREATE TABLE "UserAudits" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "action" "public"."user_audit_action_enum" NOT NULL, "actorUserId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_eb4b7aa83f9fd720f062a2a1fb8" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_d0407ad490d72d92d4c2598782" ON "UserAudits" ("userId", "createdAt") `,
        );
        await queryRunner.query(
            `ALTER TABLE "resident" ADD CONSTRAINT "FK_9f33f1c7b6d5a56be451d757821" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "resident" ADD CONSTRAINT "FK_3fc226b51df71e9b6113277322b" FOREIGN KEY ("houseId") REFERENCES "house"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "ManagerPermissions" ADD CONSTRAINT "FK_manager_permission_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "ManagerPermissions" ADD CONSTRAINT "FK_manager_permission_townhouse" FOREIGN KEY ("townhouseId") REFERENCES "townhouse"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "house" ADD CONSTRAINT "FK_c3951d66878b9f04754f923e175" FOREIGN KEY ("townhouseId") REFERENCES "townhouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "house" DROP CONSTRAINT "FK_c3951d66878b9f04754f923e175"`);
        await queryRunner.query(`ALTER TABLE "ManagerPermissions" DROP CONSTRAINT "FK_manager_permission_townhouse"`);
        await queryRunner.query(`ALTER TABLE "ManagerPermissions" DROP CONSTRAINT "FK_manager_permission_user"`);
        await queryRunner.query(`ALTER TABLE "resident" DROP CONSTRAINT "FK_3fc226b51df71e9b6113277322b"`);
        await queryRunner.query(`ALTER TABLE "resident" DROP CONSTRAINT "FK_9f33f1c7b6d5a56be451d757821"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0407ad490d72d92d4c2598782"`);
        await queryRunner.query(`DROP TABLE "UserAudits"`);
        await queryRunner.query(`DROP TYPE "public"."user_audit_action_enum"`);
        await queryRunner.query(`DROP TABLE "house"`);
        await queryRunner.query(`DROP TABLE "townhouse"`);
        await queryRunner.query(`DROP TYPE "public"."townhouse_situation_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_manager_permission_user_townhouse"`);
        await queryRunner.query(`DROP TABLE "ManagerPermissions"`);
        await queryRunner.query(`DROP TYPE "public"."manager_permission_situation_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_situation_enum"`);
        await queryRunner.query(`DROP TABLE "resident"`);
    }
}
