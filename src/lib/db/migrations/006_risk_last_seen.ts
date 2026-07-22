import type { Knex } from 'knex';

const DATE_COLUMN = 'lastSeenAt';
const URL_COLUMN = 'lastSeenUrl';

export async function up(knex: Knex): Promise<void> {
  const hasDateColumn = await knex.schema.hasColumn('risks', DATE_COLUMN);
  const hasUrlColumn = await knex.schema.hasColumn('risks', URL_COLUMN);
  if (hasDateColumn && hasUrlColumn) return;

  await knex.schema.alterTable('risks', (table) => {
    if (!hasDateColumn) table.string(DATE_COLUMN).nullable();
    if (!hasUrlColumn) table.text(URL_COLUMN).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasDateColumn = await knex.schema.hasColumn('risks', DATE_COLUMN);
  const hasUrlColumn = await knex.schema.hasColumn('risks', URL_COLUMN);
  if (!hasDateColumn && !hasUrlColumn) return;

  await knex.schema.alterTable('risks', (table) => {
    if (hasDateColumn) table.dropColumn(DATE_COLUMN);
    if (hasUrlColumn) table.dropColumn(URL_COLUMN);
  });
}
