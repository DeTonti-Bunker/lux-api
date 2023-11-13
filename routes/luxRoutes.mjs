import execLuxReader from '../utils/luxReader.mjs';
import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();
import path from 'path';

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
      const execPromise = execLuxReader();

      execPromise.then((result) => {
        connection.socket.send(`${result.lux}`);
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

          if (await isThresholdExceeded(luxValue)) {
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
            resolve({ luxValue: (await getCurrentLuxValue())?.luxValue });
          }
        }
      );
    });

    return luxPromise;
  });

  fastify.get('/api/lux', async function handler(request, reply) {
    const execPromise = execLuxReader('lux_reader.py');

    execPromise.catch((error) => {
      if (error === 'pythonScript') {
        reply
          .status(500)
          .send({ error: 'Failed to execute light reader script' });
      } else if (error === 'luxLine') {
        reply.status(500).send({ error: 'Failed to retrieve Lux value' });
      } else {
        reply.status(500).send({ error: 'Unknown error' });
      }
    });

    return execPromise;
  });

  fastify.get('/api/lux/max', async function handler(request, reply) {
    return { lux: 188 };
  });

  fastify.get('/api/lux/min', async function handler(request, reply) {
    return { lux: 0 };
  });

  async function getCurrentLuxValue() {
    const luxValuePromise = new Promise((resolve, reject) => {
      db.get(
        `SELECT current_value FROM lux ORDER BY id DESC limit 1`,
        (err, row) => {
          if (err) {
            reject();
            return console.error(err.message);
          }

          console.log(row, 'lux value row');
          resolve({ luxValue: row?.current_value });
        }
      );
    });

    return luxValuePromise;
  }

  async function isThresholdExceeded(newLux) {
    const currentLux = (await getCurrentLuxValue())?.luxValue;
    console.log(currentLux, 'currentLux');
    if (currentLux === undefined) return true;

    return (currentLux < 10 && newLux > 10) || (currentLux > 10 && newLux < 10);
  }

  function getTimestamp() {
    const now = new Date();
    const dateTimeString = now.toISOString();
    const sqliteDateTimeString = dateTimeString
      .replace('T', ' ')
      .replace('Z', '');

    return sqliteDateTimeString;
  }
}

export default luxRoutes;
