import { BaseBoxShapeTool } from '@tldraw/tldraw';

export class NoteTool extends BaseBoxShapeTool {
  static override id = 'wikitext-note';
  static override initial = 'idle';
  override shapeType = 'wikitext-note';
}
