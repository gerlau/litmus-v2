import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('incidents');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable('incidents', (table) => {
    table.string('id').primary();
    table.text('postDate').notNullable();
    table.text('postUrl').notNullable();
    table.text('summary').nullable();
    table.json('risks').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
  });
}
