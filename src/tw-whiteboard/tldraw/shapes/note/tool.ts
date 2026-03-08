import { NoteShapeTool } from '@tldraw/tldraw';

export class NoteTool extends NoteShapeTool {
  static override id = 'note';
  override shapeType = 'note';
}
