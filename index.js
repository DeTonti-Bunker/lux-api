import Fastify from 'fastify';
import cors from '@fastify/cors';
import Websocket from '@fastify/websocket';
import luxRoutes from './routes/luxRoutes.mjs';
import staticRoutes from './routes/staticRoutes.mjs';
import imageRoutes from './routes/imageRoutes.mjs';
import emojiRoutes from './routes/emojiRoutes.mjs';

const fastify = Fastify({
  logger: true,
});

fastify.register(Websocket);
fastify.register(luxRoutes);
fastify.register(staticRoutes);
fastify.register(imageRoutes);
fastify.register(emojiRoutes);

await fastify.register(cors, {
  origin: ['http://localhost:3000', 'https://detontibunker.duckdns.org'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
