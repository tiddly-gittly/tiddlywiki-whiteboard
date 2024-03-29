import { BaseBoxShapeTool } from '@tldraw/tldraw';

export class TranscludeTool extends BaseBoxShapeTool {
  static override id = 'transclude';
  static override initial = 'idle';
  override shapeType = 'transclude';
}
