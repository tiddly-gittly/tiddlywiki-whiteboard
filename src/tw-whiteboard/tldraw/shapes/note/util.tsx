import { NoteShapeOptions, NoteShapeUtil } from '@tldraw/tldraw';
import { TLNoteShape } from '@tldraw/editor';
import { NoteComponent } from './component';
import { noteShapeMigrations, noteShapeProps } from './TLNoteShape';

export class WIkiTextTLNoteShapeUtil extends NoteShapeUtil {
  // Per tldraw guidance, fully replace the built-in note shape
  static override type = 'note' as const;
  static override props = noteShapeProps;
  static override migrations = noteShapeMigrations;
  override isAspectRatioLocked = () => false;
  override canBind = () => true;
  override canEdit = () => true;

  override options: NoteShapeOptions = {
    resizeMode: 'scale',
  };

  component(shape: TLNoteShape) {
    return <NoteComponent shape={shape} isDarkMode={this.editor.user.getIsDarkMode()} />;
  }
}
