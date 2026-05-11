import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // defer_foreign_keys defers FK checks until commit — valid inside a transaction
    await trx.raw('PRAGMA defer_foreign_keys = ON');
    const features = await trx('features').select('id');
    for (const f of features) {
      const risks = await trx('risks')
        .where({ featureId: f.id })
        .orderBy('createdAt', 'asc')
        .select('id');
      for (let i = 0; i < risks.length; i++) {
        const oldId = risks[i].id as string;
        const newId = `${f.id}-R-${String(i + 1).padStart(3, '0')}`;
        if (oldId === newId) continue;
        await trx('findings').where({ riskId: oldId }).update({ riskId: newId });
        await trx('risks').where({ id: oldId }).update({ id: newId });
      }
    }
  });
}

export async function down(_knex: Knex): Promise<void> {
  // Not implemented — restore real.db.backup to revert
}
