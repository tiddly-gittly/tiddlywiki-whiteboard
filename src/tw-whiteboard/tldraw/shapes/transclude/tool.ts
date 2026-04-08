import { BaseBoxShapeTool } from '@tldraw/tldraw';

export class TranscludeTool extends BaseBoxShapeTool {
  static override id = 'transclude';
  static override initial = 'idle';
  // @ts-expect-error custom shapes have custom strings representing shape type
  override shapeType = 'transclude';
}
