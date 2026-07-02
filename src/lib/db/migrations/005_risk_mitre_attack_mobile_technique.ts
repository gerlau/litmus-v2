import type { Knex } from 'knex';

const COLUMN = 'mitreAttackMobileTechniqueId';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('risks', COLUMN);
  if (hasColumn) return;

  await knex.schema.alterTable('risks', (table) => {
    table.string(COLUMN).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('risks', COLUMN);
  if (!hasColumn) return;

  await knex.schema.alterTable('risks', (table) => {
    table.dropColumn(COLUMN);
  });
}
