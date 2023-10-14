import Fastify from 'fastify';
import cors from '@fastify/cors';
import Websocket from '@fastify/websocket';

import luxRoutes from './routes/luxRoutes.mjs';
import luxTestRoutes from './routes/luxTestRoutes.mjs';

import staticRoutes from './routes/staticRoutes.mjs';
import imageRoutes from './routes/imageRoutes.mjs';

const fastify = Fastify({
  logger: true,
});

fastify.register(Websocket);

if (process.env.LUX_API_MODE) {
  fastify.register(luxTestRoutes);
} else {
  fastify.register(luxRoutes);
}

fastify.register(staticRoutes);
fastify.register(imageRoutes);

await fastify.register(cors, {
  origin: ['http://localhost:8080', 'https://detontibunker.duckdns.org'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
