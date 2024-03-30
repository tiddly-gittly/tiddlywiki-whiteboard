import { TLBaseShape, TLDefaultColorStyle } from '@tldraw/tldraw';

export type TranscludeShape = TLBaseShape<'transclude', { color: TLDefaultColorStyle; field?: string; folded: boolean; h: number; title?: string; w: number }> & {
  meta: { foldedH?: number; foldedW?: number; unfoldedH?: number; unfoldedW?: number };
};
