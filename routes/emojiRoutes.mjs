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
    return getEmojiCode();
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
              broadcastEmoji(emojiCode);
              resolve({ emojiCode: emojiCode, id: this.lastID });
            }
          );
        }
      );
    });

    return dbPromise;
  });

  const clients = new Map();
  fastify.get(
    '/api/emoji/status',
    { websocket: true },
    async (connection, req) => {
      const emojiCode = await getEmojiCode();
      console.log(emojiCode, 'emojiCode');
      connection.socket.send(`${emojiCode.emojiCode}`);

      const clientId = Math.random().toString(36).substring(2);
      clients.set(clientId, connection);

      connection.socket.on('close', () => {
        clients.delete(clientId);
      });
    }
  );

  function broadcastEmoji(emojiCode) {
    for (const [clientId, client] of clients) {
      if (client.socket.readyState === 1) {
        client.socket.send(`${emojiCode}`);
      }
    }
  }

  async function getEmojiCode() {
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
  }
}

export default emojiRoutes;
