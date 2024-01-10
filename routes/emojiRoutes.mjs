import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();

import path from 'path';
import { EmojiService } from '../services/emoji.service.mjs';

async function emojiRoutes(fastify, options) {
  const db = new sqlite3.Database(
    path.join(process.cwd(), 'db/lux.db'),
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQlite database.');
    }
  );

  const emojiService = new EmojiService(db);

  fastify.get('/api/emoji', async (request, reply) => {
    return await emojiService.getActiveEmoji();
  });

  fastify.post('/api/emoji', async (request, reply) => {
    const emojiCode = request.body.emojiCode;

    await emojiService.createTableIfNotExists();
    await emojiService.addEmoji(emojiCode);

    broadcastEmoji(emojiCode);

    return { emojiCode };
  });

  const clients = new Map();
  fastify.get(
    '/api/emoji/status',
    { websocket: true },
    async (connection, req) => {
      const emojiCode = await emojiService.getActiveEmoji();
      connection.socket.send(`${emojiCode.emojiCode}`);

      const clientId = Math.random().toString(36).substring(2);
      clients.set(clientId, connection);

      connection.socket.on('close', () => {
        clients.delete(clientId);
      });
    }
  );

  function broadcastEmoji(emojiCode) {
    for (const [clientId, client] of clients) {
      if (client.socket.readyState === 1) {
        client.socket.send(`${emojiCode}`);
      }
    }
  }
}

export default emojiRoutes;
