import { NoteShapeOptions, NoteShapeUtil, TLNoteShape } from '@tldraw/tldraw';
import { NoteComponent } from './component';
import { noteShapeMigrations, noteShapeProps } from './TLNoteShape';

export class WIkiTextTLNoteShapeUtil extends NoteShapeUtil {
  static override type = 'wikitext-note' as const;
  static override props = noteShapeProps;
  static override migrations = noteShapeMigrations;
  override isAspectRatioLocked = () => false;
  override canBind = () => true;
  override canEdit = () => true;

  override options: NoteShapeOptions = {
    resizeMode: 'scale',
  };

  getDefaultProps(): TLNoteShape['props'] & { h: number; w: number } {
    return {
      color: 'yellow',
      text: '',
      size: 'm',
      font: 'draw',
      align: 'middle',
      verticalAlign: 'middle',
      labelColor: 'black',
      growY: 0,
      fontSizeAdjustment: 0,
      url: '',
      scale: 2,
      w: 100,
      h: 100,
    };
  }

  component(shape: TLNoteShape) {
    return <NoteComponent shape={shape} isDarkMode={this.editor.user.getIsDarkMode()} />;
  }
}
