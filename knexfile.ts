import type { Knex } from 'knex';
import * as path from 'path';
import * as os from 'os';

// Used by the Knex CLI: `npx knex migrate:latest`
// Requires a TypeScript runner: `npx tsx ./node_modules/.bin/knex migrate:latest`

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(os.homedir(), '.litmus-v2', 'data.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'src', 'lib', 'db', 'migrations'),
      loadExtensions: ['.ts', '.js'],
    },
  },
};

export default config;
