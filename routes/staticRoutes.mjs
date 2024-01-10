import fs from 'fs';
import path from 'path';
import sqlite3Module from 'sqlite3';
import { LuxService } from '../services/lux.service.mjs';
const sqlite3 = sqlite3Module.verbose();

async function staticRoutes(fastify, options) {
  let db = new sqlite3.Database(
    path.join(process.cwd(), 'db/lux.db'),
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }
  );

  const luxService = new LuxService(db);

  fastify.get('/', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'index.html');

    try {
      const { luxValue } = await luxService.getCurrentLuxValue(db);

      let replacement = 'off.png';
      if (luxValue > 10) {
        replacement = 'on.png';
      }

      let data = fs.readFileSync(filePath, 'utf8');
      data = data.replace('{{OG_IMAGE}}', `/images/${replacement}`);

      return reply.header('Content-Type', 'text/html').send(data);
    } catch (error) {
      console.log(error);
      reply.code(500).send('Internal server error');
    }
  });

  fastify.get('/script.js', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'script.js');

    try {
      let data = fs.readFileSync(filePath, 'utf8');

      if (process.env.LUX_API_MODE) {
        data = data
          .replace('{{HTTP}}', 'http')
          .replace('{{WSS}}', 'ws')
          .replace('{{ROOT_URL}}', 'localhost:3000');
      } else {
        data = data
          .replace('{{HTTP}}', 'https')
          .replace('{{WSS}}', 'wss')
          .replace('{{ROOT_URL}}', 'detontibunker.duckdns.org');
      }

      reply.header('Content-Type', 'application/javascript').send(data);
    } catch (error) {
      console.log(error);
      reply.code(500).send('Internal server error');
    }
  });

  fastify.get('/styles.css', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'styles.css');

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      reply.header('Content-Type', 'text/css').send(data);
    } catch (error) {
      reply.code(500).send('Internal server error');
    }
  });
}

export default staticRoutes;
