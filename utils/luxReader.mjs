import { exec } from 'child_process';

function execLuxReaderScript(scriptFileName) {
  const execPromise = new Promise((resolve, reject) => {
    exec(`python3 ./scripts/${scriptFileName}`, (error, stdout, stderr) => {
      if (error) {
        reject(`error running python script: ${error}`);
        return;
      }

      const luxLine = stdout
        .split('\n')
        .find((line) => line.startsWith('Lux:'));

      if (!luxLine) {
        reject('unable to parse lux line');
        return;
      }

      const luxValue = luxLine.split(':')[1].trim();
      resolve({ lux: luxValue });
    });
  });

  return execPromise;
}

function execLuxReader() {
  return execLuxReaderScript('lux_reader.py');
}

export function execLuxReaderTest() {
  return execLuxReaderScript('lux_reader_test.py');
}

export default execLuxReader;
