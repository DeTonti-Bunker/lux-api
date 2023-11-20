async function getCurrentLuxValue(db) {
  const luxValuePromise = new Promise((resolve, reject) => {
    db.get(
      `SELECT current_value FROM lux ORDER BY id DESC limit 1`,
      (err, row) => {
        if (err) {
          reject();
          return console.error(err.message);
        }

        console.log(row, 'lux value row');
        resolve({ luxValue: row?.current_value });
      }
    );
  });

  return luxValuePromise;
}

async function isThresholdExceeded(db, newLux) {
  const currentLux = (await getCurrentLuxValue(db))?.luxValue;
  console.log(currentLux, 'currentLux');
  if (currentLux === undefined) return true;

  return (currentLux < 10 && newLux > 10) || (currentLux > 10 && newLux < 10);
}

function getTimestamp() {
  const now = new Date();
  const dateTimeString = now.toISOString();
  const sqliteDateTimeString = dateTimeString
    .replace('T', ' ')
    .replace('Z', '');

  return sqliteDateTimeString;
}

export { getCurrentLuxValue, isThresholdExceeded, getTimestamp };
