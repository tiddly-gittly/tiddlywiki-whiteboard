import { DefaultColorStyle, Rectangle2d, resizeBox, ShapeProps, ShapeUtil, T, TLOnResizeHandler } from '@tldraw/tldraw';
import { NoteComponent } from './component';
import { NoteShape } from './type';

export class NoteShapeUtil extends ShapeUtil<NoteShape> {
  static override type = 'wikitext-note' as const;
  override isAspectRatioLocked = (_shape: NoteShape) => false;
  override canResize = (_shape: NoteShape) => true;
  override canBind = (_shape: NoteShape) => true;
  override canEdit = () => true;

  static override props: ShapeProps<NoteShape> = {
    color: DefaultColorStyle,
    text: T.optional(T.string),
    h: T.number,
    w: T.number,
  };

  getDefaultProps(): NoteShape['props'] {
    return {
      w: 100,
      h: 100,
      color: 'yellow',
    };
  }

  getGeometry(shape: NoteShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: NoteShape) {
    return <NoteComponent shape={shape} isDarkMode={this.editor.user.getIsDarkMode()} />;
  }

  indicator(shape: NoteShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize: TLOnResizeHandler<NoteShape> = (shape, info) => {
    return resizeBox(shape, info);
  };
}
