import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();
import path from 'path';
import {
  getCurrentLuxValue,
  getTimestamp,
  isThresholdExceeded,
} from '../util/lux-db.mjs';

async function luxRoutes(fastify, options) {
  let db = new sqlite3.Database(
    path.join(process.cwd(), 'db/lux.db'),
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }
  );

  fastify.get('/status', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message) => {
      const execPromise = getCurrentLuxValue(db);

      execPromise.then((result) => {
        console.log('result sending!!', result);
        connection.socket.send(`${result.luxValue}`);
      });
    });
  });

  fastify.post('/api/lux', async (request, reply) => {
    const luxValue = request.body.luxValue;
    console.log(luxValue, 'luxValue from request');

    const luxPromise = new Promise((resolve, reject) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS lux (
        id INTEGER PRIMARY KEY,
        current_value INTEGER,
        date TEXT)`,
        async (err) => {
          if (err) {
            reject();
            return console.error(err.message);
          }
          console.log('Lux table created or already exists.');

          if (await isThresholdExceeded(db, luxValue)) {
            db.run(
              `INSERT INTO lux (current_value, date) VALUES (?, ?)`,
              [luxValue, getTimestamp()],
              function (err) {
                if (err) {
                  reject();
                  return console.error(err);
                }

                console.log(`Row inserted with ID: ${this.lastID}`);
                resolve({ luxValue: luxValue, id: this.lastID });
              }
            );
          } else {
            resolve({ luxValue: (await getCurrentLuxValue(db))?.luxValue });
          }
        }
      );
    });

    return luxPromise;
  });

  fastify.get('/api/lux', async function handler(request, reply) {
    const execPromise = getCurrentLuxValue(db);
    return execPromise;
  });

  fastify.get('/api/lux/max', async function handler(request, reply) {
    return { lux: 188 };
  });

  fastify.get('/api/lux/min', async function handler(request, reply) {
    return { lux: 0 };
  });
}

export default luxRoutes;
