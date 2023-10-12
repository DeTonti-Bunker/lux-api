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

    const execPromise = execLuxReader('lux_reader.py');

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

    const execPromise = execLuxReader('lux_reader_test.py');

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

  handleExecErrors(promise);

  return execPromise;
});

//for testing outside of a raspberry pi.
fastify.get('/api/lux/test', async function handler(request, reply) {
  const execPromise = execLuxReader('lux_reader_test.py');

  handleExecErrors(execPromise);

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

function handleExecErrors(promise) {
  promise.catch((error) => {
    interpretLuxError(error);
  });
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

function execLuxReader(scriptFileName) {
  const execPromise = new Promise((resolve, reject) => {
    exec(`python3 ./scripts/${scriptFileName}`, (error, stdout, stderr) => {
      if (error) {
        reject('pythonScript');
        return;
      }

      const luxLine = stdout
        .split('\n')
        .find((line) => line.startsWith('Lux:'));

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
