import Fastify from 'fastify';
import cors from '@fastify/cors';
import { exec } from 'child_process';
import Websocket from '@fastify/websocket';

const fastify = Fastify({
  logger: true,
});

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

fastify.get('/api/lux', async function handler(request, reply) {
  const execPromise = execLuxReader();

  execPromise.catch((error) => {
    interpretLuxError(error);
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

function execLuxReader() {
  const execPromise = new Promise((resolve, reject) => {
    exec('python3 ./scripts/lux_reader.py', (error, stdout, stderr) => {
      if (error) {
        reject('pythonScript');
        return;
      }
      console.log(stdout);

      const luxLine = stdout
        .split('\n')
        .find((line) => line.startsWith('Lux:'));
      console.log(luxLine, 'luxLine');

      if (!luxLine) {
        reject('luxLine');
        return;
      }

      const luxValue = luxLine.split(':')[1].trim();
      resolve({ lux: luxValue });
    });
  });

  return execPromise;
}

function interpretLuxError(error) {
  if (error === 'pythonScript') {
    reply.status(500).send({ error: 'Failed to execute light reader script' });
  } else if (error === 'luxLine') {
    reply.status(500).send({ error: 'Failed to retrieve Lux value' });
  } else {
    reply.status(500).send({ error: 'Unknown error' });
  }
}
