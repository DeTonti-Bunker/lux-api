import Fastify from 'fastify';
import cors from '@fastify/cors';
import { exec } from 'child_process';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: ['http://localhost:8080', 'https://detontibunker.duckdns.org'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

fastify.get('/api/lux', async function handler(request, reply) {
  const execPromise = execLuxReader();

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
  return { lux: 88000 };
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
      }
      console.log(stdout);

      const luxLine = stdout
        .split('\n')
        .find((line) => line.startsWith('Lux:'));
      console.log(luxLine, 'luxLine');

      if (!luxLine) {
        reject('luxLine');
      }

      const luxValue = luxLine.split(':')[1].trim();
      resolve({ lux: luxValue });
    });
  });

  return execPromise;
}
