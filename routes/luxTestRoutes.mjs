import { execLuxReaderTest } from '../utils/luxReader.mjs';

async function luxTestRoutes(fastify, options) {
  //for testing outside of a raspberry pi.
  fastify.get('/api/lux', async function handler(request, reply) {
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

  //for testing outside of a raspberry pi
  fastify.get('/status', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message) => {
      const execPromise = execLuxReaderTest();

      execPromise.then((result) => {
        connection.socket.send(`${result.lux}`);
      });
    });
  });
}

export default luxTestRoutes;
