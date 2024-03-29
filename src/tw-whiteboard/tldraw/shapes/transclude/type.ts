import { TLBaseShape, TLDefaultColorStyle } from '@tldraw/tldraw';

export type TranscludeShape = TLBaseShape<'transclude', { color: TLDefaultColorStyle; field?: string; h: number; title?: string; w: number }>;
