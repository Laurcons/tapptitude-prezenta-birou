import fs from 'fs/promises';

export async function isDisabled() {
  return fs
    .readFile('./isdisabled')
    .then(() => true)
    .catch(() => false);
}
