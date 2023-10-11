import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: ['http://localhost:8080'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

fastify.get('/lux', async function handler(request, reply) {
  const randomInt = Math.floor(Math.random() * (88000 - 0 + 1)) + 0;
  return { lux: randomInt };
});

fastify.get('/lux/max', async function handler(request, reply) {
  return { lux: 88000 };
});

fastify.get('/lux/min', async function handler(request, reply) {
  return { lux: 0 };
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
