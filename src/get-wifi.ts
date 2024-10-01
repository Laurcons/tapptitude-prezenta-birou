import { exec } from 'child_process';

export function getWifiName() {
  return new Promise((res, rej) => {
    exec('iwgetid -r', (err, stdout) => {
      if (err) return rej(err);
      res(stdout.trim());
    });
  });
}
