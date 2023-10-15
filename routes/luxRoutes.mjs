import execLuxReader from '../utils/luxReader.mjs';

async function luxRoutes(fastify, options) {
  fastify.get('/status', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message) => {
      const execPromise = execLuxReader();

      execPromise.then((result) => {
        connection.socket.send(`${result.lux}`);
      });
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

  fastify.get('/api/lux/max', async function handler(request, reply) {
    return { lux: 188 };
  });

  fastify.get('/api/lux/min', async function handler(request, reply) {
    return { lux: 0 };
  });
}

export default luxRoutes;
