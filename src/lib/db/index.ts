import knex from 'knex';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const dbDir = path.join(os.homedir(), '.litmus-v2');
fs.mkdirSync(dbDir, { recursive: true });

const useMock = process.env.LITMUS_USE_MOCK === 'true';
const dbFilename = useMock ? 'data.db' : 'real.db';

export const db = knex({
  client: 'better-sqlite3',
  connection: { filename: path.join(dbDir, dbFilename) },
  useNullAsDefault: true,
  pool: {
    afterCreate(
      conn: { pragma: (source: string) => unknown },
      done: (err: Error | null) => void,
    ) {
      conn.pragma('foreign_keys = ON');
      done(null);
    },
  },
});

const migrationSource = {
  getMigrations: async (_loadExtensions: readonly string[]) => [
    '001_initial',
    '002_incidents',
    '003_risk_id_format',
    '004_mitre_mobile_techniques',
    '005_risk_mitre_attack_mobile_technique',
    '006_risk_last_seen',
    '007_remove_incidents',
  ],
  getMigrationName: (migration: string) => migration,
  getMigration: async (migration: string) => {
    if (migration === '007_remove_incidents') {
      return import('./migrations/007_remove_incidents');
    }
    if (migration === '006_risk_last_seen') {
      return import('./migrations/006_risk_last_seen');
    }
    if (migration === '005_risk_mitre_attack_mobile_technique') {
      return import('./migrations/005_risk_mitre_attack_mobile_technique');
    }
    if (migration === '004_mitre_mobile_techniques') return import('./migrations/004_mitre_mobile_techniques');
    if (migration === '003_risk_id_format') return import('./migrations/003_risk_id_format');
    if (migration === '002_incidents') return import('./migrations/002_incidents');
    return import('./migrations/001_initial');
  },
};

let _initPromise: Promise<void> | null = null;

export function init(): Promise<void> {
  if (!_initPromise) {
    _initPromise = (async () => {
      await db.migrate.latest({ migrationSource });
      if (useMock) {
        const rows = await db('features').count('* as count');
        const isEmpty = Number((rows[0] as { count: string | number }).count) === 0;
        if (isEmpty) {
          const { seed } = await import('./seed');
          await seed(db);
        }
      }
    })();
  }
  return _initPromise;
}
