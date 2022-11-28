import { del, get, set } from 'idb-keyval';

// Used for clipboard

const ID = 'tldraw_clipboard';

export async function getClipboard(): Promise<string | undefined> {
  return await get(ID);
}

export async function setClipboard(item: string): Promise<void> {
  return await set(ID, item);
}

export async function clearClipboard(): Promise<void> {
  return await del(ID);
}
