import { TLBaseShape, TLDefaultColorStyle } from '@tldraw/tldraw';

export type NoteShape = TLBaseShape<'wikitext-note', { color: TLDefaultColorStyle; h: number; text?: string; w: number }>;
