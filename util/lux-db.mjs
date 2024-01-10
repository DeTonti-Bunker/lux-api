function getTimestamp() {
  const now = new Date();
  const dateTimeString = now.toISOString();
  const sqliteDateTimeString = dateTimeString
    .replace('T', ' ')
    .replace('Z', '');

  return sqliteDateTimeString;
}

export { getTimestamp };
