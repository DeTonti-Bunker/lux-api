import { getTimestamp } from '../util/lux-db.mjs';

export class LuxService {
  db;

  constructor(db) {
    this.db = db;
  }

  async createTableIfNotExists() {
    const promise = new Promise((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS lux (
        id INTEGER PRIMARY KEY,
        current_value INTEGER, date TEXT)`,
        (err) => {
          if (err) {
            reject();
            return console.error(err.message);
          }
          console.log('Lux table created or already exists.');
          resolve();
        }
      );
    });

    return promise;
  }

  async getCurrentLuxValue() {
    const promise = new Promise((resolve, reject) => {
      this.db.get(
        `SELECT current_value FROM lux ORDER BY id DESC limit 1`,
        (err, row) => {
          if (err) {
            reject();
            return console.error(err.message);
          }

          resolve({ luxValue: row?.current_value });
        }
      );
    });

    return promise;
  }

  async addLuxValue(luxValue) {
    const promise = new Promise(async (resolve, reject) => {
      if (await this.isThresholdExceeded(luxValue)) {
        this.db.run(
          `INSERT INTO lux (current_value, date) VALUES (?, ?)`,
          [luxValue, getTimestamp()],
          function (err) {
            if (err) {
              reject();
              return console.error(err);
            }

            resolve({ luxValue, id: this.lastID });
          }
        );
      } else {
        resolve({ luxValue: (await this.getCurrentLuxValue())?.luxValue });
      }
    });

    return promise;
  }

  async isThresholdExceeded(newLux) {
    const currentLux = (await this.getCurrentLuxValue())?.luxValue;
    if (currentLux === undefined) return true;

    return (currentLux < 10 && newLux > 10) || (currentLux > 10 && newLux < 10);
  }
}
