import Fastify from 'fastify';
import cors from '@fastify/cors';
import Websocket from '@fastify/websocket';
import staticRoutes from './routes/staticRoutes.mjs';
import imageRoutes from './routes/imageRoutes.mjs';
import execLuxReader from './utils/luxReader.mjs';
import { execLuxReaderTest } from './utils/luxReader.mjs';

const fastify = Fastify({
  logger: true,
});

fastify.register(staticRoutes);
fastify.register(imageRoutes);
fastify.register(Websocket);

await fastify.register(cors, {
  origin: ['http://localhost:8080', 'https://detontibunker.duckdns.org'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

fastify.get('/status', { websocket: true }, (connection, req) => {
  connection.socket.on('message', (message) => {
    console.log('Received message: ', message);

    const execPromise = execLuxReader();

    execPromise.then((result) => {
      connection.socket.send(`${result.lux}`);
    });
  });

  connection.socket.on('close', () => {
    console.log('WebSocket closed');
  });
});

//for testing outside of a raspberry pi
fastify.get('/status/test', { websocket: true }, (connection, req) => {
  connection.socket.on('message', (message) => {
    console.log('Received message: ', message);

    const execPromise = execLuxReaderTest();

    execPromise.then((result) => {
      connection.socket.send(`${result.lux}`);
    });
  });

  connection.socket.on('close', () => {
    console.log('WebSocket closed');
  });
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

//for testing outside of a raspberry pi.
fastify.get('/api/lux/test', async function handler(request, reply) {
  const execPromise = execLuxReaderTest();

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

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
