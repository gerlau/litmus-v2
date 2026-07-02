import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('mitre_mobile_techniques');
  if (exists) return;

  await knex.schema.createTable('mitre_mobile_techniques', (table) => {
    table.string('id').primary();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mitre_mobile_techniques');
}
