import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbDir = path.join(os.homedir(), '.litmus-v2');
const columnName = 'mitreAttackMobileTechniqueId';

for (const filename of ['data.db', 'real.db']) {
  const db = new Database(path.join(dbDir, filename));

  try {
    const columns = db.prepare('PRAGMA table_info(risks)').all();
    if (!columns.some((column) => column.name === columnName)) {
      db.exec(`ALTER TABLE risks ADD COLUMN ${columnName} TEXT`);
    }

    const verified = db
      .prepare('PRAGMA table_info(risks)')
      .all()
      .some((column) => column.name === columnName);

    console.log(`${filename}: ${verified ? 'ok' : 'missing'}`);
  } finally {
    db.close();
  }
}
