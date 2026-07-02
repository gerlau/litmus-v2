import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';

const TAXII_BASE_URL = 'https://attack-taxii.mitre.org/api/v21';
const MOBILE_COLLECTION_ID = 'x-mitre-collection--dac0d2d7-8653-445c-9bff-82f934c1e858';
const TAXII_ACCEPT = 'application/taxii+json;version=2.1';
const DB_FILENAMES = ['data.db', 'real.db'];

function stripMarkup(value) {
  return value
    .replaceAll(/```[\s\S]*?```/g, ' ')
    .replaceAll(/`([^`]+)`/g, '$1')
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replaceAll(/[*_>#-]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function getTechniqueExternalId(object) {
  const refs = Array.isArray(object.external_references) ? object.external_references : [];
  const ref = refs.find((candidate) => typeof candidate?.external_id === 'string' && /^T\d{4}(?:\.\d{3})?$/.test(candidate.external_id));
  return ref?.external_id ?? null;
}

function normalizeTechnique(object) {
  const id = getTechniqueExternalId(object);
  const name = typeof object.name === 'string' ? object.name.trim() : '';
  const description = typeof object.description === 'string' ? stripMarkup(object.description) : '';

  if (!id || !name || !description) return null;
  if (object.revoked === true || object.x_mitre_deprecated === true) return null;
  if (object.type !== 'attack-pattern') return null;

  return { id, name, description };
}

async function fetchCollectionObjects() {
  let url = `${TAXII_BASE_URL}/collections/${MOBILE_COLLECTION_ID}/objects/`;
  const objects = [];

  while (url) {
    const response = await fetch(url, {
      headers: { Accept: TAXII_ACCEPT },
    });

    if (!response.ok) {
      throw new Error(`MITRE TAXII request failed with ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    if (Array.isArray(payload.objects)) {
      objects.push(...payload.objects);
    }

    if (payload.more === true && typeof payload.next === 'string' && payload.next) {
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('next', payload.next);
      url = nextUrl.toString();
    } else {
      url = '';
    }
  }

  return objects;
}

function ensureTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS mitre_mobile_techniques (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function syncDatabase(filename, techniques) {
  const dbDir = path.join(os.homedir(), '.litmus-v2');
  fs.mkdirSync(dbDir, { recursive: true });

  const dbPath = path.join(dbDir, filename);
  const db = new Database(dbPath);

  try {
    ensureTable(db);

    const insert = db.prepare(`
      INSERT INTO mitre_mobile_techniques (id, name, description, updatedAt)
      VALUES (@id, @name, @description, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        updatedAt = CURRENT_TIMESTAMP
    `);
    const existingIds = db.prepare('SELECT id FROM mitre_mobile_techniques').all().map((row) => row.id);
    const keepIds = new Set(techniques.map((technique) => technique.id));
    const remove = db.prepare('DELETE FROM mitre_mobile_techniques WHERE id = ?');

    const tx = db.transaction(() => {
      for (const technique of techniques) {
        insert.run(technique);
      }

      for (const existingId of existingIds) {
        if (!keepIds.has(existingId)) {
          remove.run(existingId);
        }
      }
    });

    tx();
  } finally {
    db.close();
  }

  return dbPath;
}

async function main() {
  const objects = await fetchCollectionObjects();
  const techniques = objects
    .map(normalizeTechnique)
    .filter((technique) => technique !== null)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (techniques.length === 0) {
    throw new Error('MITRE TAXII sync returned no Mobile ATT&CK techniques');
  }

  const results = DB_FILENAMES.map((filename) => ({
    filename,
    dbPath: syncDatabase(filename, techniques),
  }));

  console.log(`Synced ${techniques.length} MITRE ATT&CK Mobile techniques.`);
  for (const result of results) {
    console.log(`Updated ${result.filename}: ${result.dbPath}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
