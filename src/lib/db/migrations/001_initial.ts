import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('features', (table) => {
    table.string('id').primary();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.text('additionalContext').nullable();
    table.json('demonstration').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('risks', (table) => {
    table.string('id').primary();
    table.string('featureId').notNullable().references('features.id').onDelete('CASCADE');
    table.text('title').notNullable();
    table.text('description').notNullable();
    table.text('goal').notNullable();
    table.boolean('isBlocking').notNullable().defaultTo(false);
    table.json('demonstration').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('apps', (table) => {
    table.string('id').primary();
    table.text('name').notNullable();
    table.text('sector').notNullable();
    table.text('agency').notNullable();
    table.text('version').notNullable();
    table.json('cisos').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('findings', (table) => {
    table.string('id').primary();
    table.string('appId').notNullable().references('apps.id').onDelete('CASCADE');
    table.string('riskId').notNullable().references('risks.id').onDelete('CASCADE');
    table.string('status').notNullable().checkIn(['at-risk', 'reduced']);
    table.json('observation').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.unique(['appId', 'riskId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('findings');
  await knex.schema.dropTableIfExists('apps');
  await knex.schema.dropTableIfExists('risks');
  await knex.schema.dropTableIfExists('features');
}
