import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreatedAtToResident1788998400000 implements MigrationInterface {
    name = 'AddCreatedAtToResident1788998400000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'resident',
            new TableColumn({
                name: 'createdAt',
                type: 'timestamptz',
                isNullable: false,
                default: 'now()',
            }),
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('resident', 'createdAt');
    }
}
