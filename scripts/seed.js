import sqlite3Module from 'sqlite3';
const sqlite3 = sqlite3Module.verbose();

import path from 'path';

import { EmojiService } from '../services/emoji.service.mjs';
import { LuxService } from '../services/lux.service.mjs';

const db = new sqlite3.Database(
  path.join(process.cwd(), 'db/lux.db'),
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
  }
);

(async () => {
  try {
    const luxService = new LuxService(db);
    const emojiService = new EmojiService(db);

    await luxService.createTableIfNotExists();
    console.log('lux table created');
    await emojiService.createTableIfNotExists();
    console.log('emoji table created');

    await emojiService.addEmoji('127875');
    console.log(`default emoji inserted`);
    await luxService.addLuxValue(0);
    console.log(`default lux value inserted`);
  } catch (e) {
    console.log(e);
  }
})();
