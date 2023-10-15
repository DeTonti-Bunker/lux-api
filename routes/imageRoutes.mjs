import fs from 'fs';
import path from 'path';

async function imageRoutes(fastify, options) {
  fastify.get('/images/:imageName', async (request, reply) => {
    const imageName = request.params.imageName;
    const imagePath = path.join(process.cwd(), 'images', imageName);

    try {
      const data = fs.readFileSync(imagePath);
      reply.header('Content-Type', 'image/png').send(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        reply.code(404).send('Image not found');
      } else {
        reply.code(500).send('Internal Server Error');
      }
    }
  });
}

export default imageRoutes;
