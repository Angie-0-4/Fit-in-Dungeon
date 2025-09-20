import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(USERS_FILE); }
  catch { await fs.writeFile(USERS_FILE, '[]', 'utf8'); }
}

export async function readUsers() {
  await ensureFiles();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(raw);
}

export async function writeUsers(list) {
  await ensureFiles();
  const tmp = USERS_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
  await fs.rename(tmp, USERS_FILE);
}