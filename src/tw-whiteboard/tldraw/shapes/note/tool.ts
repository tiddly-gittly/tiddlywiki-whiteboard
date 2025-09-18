import { BaseBoxShapeTool } from '@tldraw/tldraw';

export class NoteTool extends BaseBoxShapeTool {
  static override id = 'note';
  static override initial = 'idle';
  override shapeType = 'note';
}
