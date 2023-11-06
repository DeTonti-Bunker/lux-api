import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();

import path from 'path';

async function emojiRoutes(fastify, options) {
  let db = new sqlite3.Database(
    path.join(process.cwd(), 'db/lux.db'),
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }
  );

  fastify.get('/api/emoji', async (request, reply) => {
    const dbPromise = new Promise((resolve, reject) => {
      db.get(`SELECT code FROM emoji ORDER BY id DESC limit 1`, (err, row) => {
        if (err) {
          reject();
          return console.error(err.message);
        }
        console.log(row, 'row');
        resolve({ emojiCode: row.code });
      });
    });

    return dbPromise;
  });

  fastify.post('/api/emoji', async (request, reply) => {
    const emojiCode = request.body.emojiCode;
    console.log(emojiCode);

    const dbPromise = new Promise((resolve, reject) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS emoji (
          id INTEGER PRIMARY KEY,
          code TEXT NOT NULL unique)`,
        (err) => {
          if (err) {
            reject();
            return console.error(err.message);
          }
          console.log('Emoji table created or already exists.');

          db.run(
            `INSERT INTO emoji (code) VALUES (?)
                  ON CONFLICT(code) DO UPDATE set code=excluded.code`,
            [emojiCode],
            function (err) {
              if (err) {
                reject();
                return console.error(err);
              }

              console.log(`Row upserted with ID: ${this.lastID}`);
              resolve({ emojiCode: emojiCode, id: this.lastID });
            }
          );
        }
      );
    });

    return dbPromise;
  });
}

export default emojiRoutes;
