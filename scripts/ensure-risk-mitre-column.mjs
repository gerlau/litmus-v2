import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbDir = path.join(os.homedir(), '.litmus-v2');
const columnsToEnsure = [
  { name: 'mitreAttackMobileTechniqueId', type: 'TEXT' },
  { name: 'lastSeenAt', type: 'TEXT' },
  { name: 'lastSeenUrl', type: 'TEXT' },
];

for (const filename of ['data.db', 'real.db']) {
  const db = new Database(path.join(dbDir, filename));

  try {
    const columns = db.prepare('PRAGMA table_info(risks)').all();
    for (const columnToEnsure of columnsToEnsure) {
      if (!columns.some((column) => column.name === columnToEnsure.name)) {
        db.exec(`ALTER TABLE risks ADD COLUMN ${columnToEnsure.name} ${columnToEnsure.type}`);
      }
    }

    const verified = columnsToEnsure.every((columnToEnsure) =>
      db
        .prepare('PRAGMA table_info(risks)')
        .all()
        .some((column) => column.name === columnToEnsure.name),
    );

    console.log(`${filename}: ${verified ? 'ok' : 'missing'}`);
  } finally {
    db.close();
  }
}
