import fs from 'fs';
import path from 'path';
import { execLuxReaderTest } from '../utils/luxReader.mjs';

async function staticRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'index.html');

    try {
      const execPromise = execLuxReaderTest();

      execPromise.then((result) => {
        let replacement = 'off.png';
        if (result.lux > 10) {
          replacement = 'on.png';
        }

        let data = fs.readFileSync(filePath, 'utf8');
        data = data.replace('{{OG_IMAGE}}', `/images/${replacement}`);

        return reply.header('Content-Type', 'text/html').send(data);
      });

      return reply;
    } catch (error) {
      reply.code(500).send('Internal server error');
    }
  });

  fastify.get('/script.js', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'script.js');

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      reply.header('Content-Type', 'application/javascript').send(data);
    } catch (error) {
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
