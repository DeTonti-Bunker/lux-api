import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();
import path from 'path';
import { LuxService } from '../services/lux.service.mjs';

async function luxRoutes(fastify, options) {
  const db = new sqlite3.Database(
    path.join(process.cwd(), 'db/lux.db'),
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }
  );

  const luxService = new LuxService(db);

  fastify.get('/status', { websocket: true }, (connection, req) => {
    console.log('status...');
    connection.socket.on('message', async (message) => {
      const currentLuxValue = await luxService.getCurrentLuxValue();
      connection.socket.send(`${currentLuxValue?.luxValue}`);
    });
  });

  fastify.post('/api/lux', async (request, reply) => {
    const newValue = request.body.luxValue;
    await luxService.createTableIfNotExists();
    const { luxValue, id } = await luxService.addLuxValue(newValue);

    return { luxValue, id };
  });

  fastify.get('/api/lux', async (request, reply) => {
    const currentLuxValue = await luxService.getCurrentLuxValue();
    return { ...currentLuxValue };
  });

  fastify.get('/api/lux/max', async (request, reply) => {
    return { lux: 188 };
  });

  fastify.get('/api/lux/min', async (request, reply) => {
    return { lux: 0 };
  });
}

export default luxRoutes;
