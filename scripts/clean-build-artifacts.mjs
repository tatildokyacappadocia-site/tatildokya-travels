import { rm } from 'node:fs/promises';

const targets = ['dist', '.astro', '.vercel/output'];

for (const target of targets) {
  await rm(target, { recursive: true, force: true });
  console.log(`[clean] removed ${target}`);
}
