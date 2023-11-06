import fs from 'fs';
import path from 'path';
import execLuxReader, { execLuxReaderTest } from '../utils/luxReader.mjs';

async function staticRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'index.html');

    try {
      let execPromise;

      if (process.env.LUX_API_MODE) {
        execPromise = execLuxReaderTest();
      } else {
        execPromise = execLuxReader();
      }

      execPromise.then((result) => {
        let replacement = 'off.png';
        if (result.lux > 10) {
          replacement = 'on.png';
        }

        let data = fs.readFileSync(filePath, 'utf8');
        data = data.replace('{{OG_IMAGE}}', `/images/${replacement}`);

        return reply.header('Content-Type', 'text/html').send(data);
      });

      return execPromise;
    } catch (error) {
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
