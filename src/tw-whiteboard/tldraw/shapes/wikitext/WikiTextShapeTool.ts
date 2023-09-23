import { StateNode } from '@tldraw/editor';
import { Idle } from './toolStates/Idle';
import { Pointing } from './toolStates/Pointing';

export class WikiTextShapeTool extends StateNode {
  static override id = 'wikitext';
  static override initial = 'idle';
  static override children = () => [Idle, Pointing];
  override shapeType = 'wikitext';
}
