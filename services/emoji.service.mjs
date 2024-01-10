export class EmojiService {
  db;

  constructor(db) {
    this.db = db;
  }

  async createTableIfNotExists() {
    const dbPromise = new Promise((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS emoji (
            id INTEGER PRIMARY KEY,
            code TEXT NOT NULL unique)`,
        (err) => {
          if (err) {
            reject();
            return console.error(err.message);
          }
          console.log('Emoji table created or already exists.');
          resolve();
        }
      );
    });

    return dbPromise;
  }

  async getActiveEmoji() {
    const dbPromise = new Promise((resolve, reject) => {
      this.db.get(
        `SELECT code FROM emoji ORDER BY id DESC limit 1`,
        (err, row) => {
          if (err) {
            reject();
            return console.error(err.message);
          }

          resolve({ emojiCode: row?.code });
        }
      );
    });

    return dbPromise;
  }

  async addEmoji(emojiCode) {
    const dbPromise = new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO emoji (code) VALUES (?)
                  ON CONFLICT(code) DO UPDATE set code=excluded.code`,
        [emojiCode],
        function (err) {
          if (err) {
            reject();
            return console.error(err);
          }

          console.log(`Row upserted with ID: ${this.lastID}`);
          resolve({ emojiCode: emojiCode, id: this.lastID });
        }
      );
    });

    return dbPromise;
  }
}
