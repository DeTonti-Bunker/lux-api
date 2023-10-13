import fs from 'fs';
import path from 'path';

async function staticRoutes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'index.html');

    try {
      let data = await fs.readFileSync(filePath, 'utf8');
      data = data.replace('{{OG_IMAGE}}', 'HELLO');
      reply.header('Content-Type', 'text/html').send(data);
    } catch (error) {
      console.log(error);
      reply.code(500).send('Internal server error');
    }
  });

  fastify.get('/script.js', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'script.js');

    try {
      const data = await fs.readFileSync(filePath, 'utf8');
      reply.header('Content-Type', 'application/javascript').send(data);
    } catch (error) {
      console.log(error);
      reply.code(500).send('Internal server error');
    }
  });

  fastify.get('/styles.css', async (request, reply) => {
    const filePath = path.join(process.cwd(), 'static', 'styles.css');

    try {
      const data = await fs.readFileSync(filePath, 'utf8');
      reply.header('Content-Type', 'text/css').send(data);
    } catch (error) {
      console.log(error);
      reply.code(500).send('Internal server error');
    }
  });
}

export default staticRoutes;
