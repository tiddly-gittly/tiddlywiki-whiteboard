import { DefaultColorStyle, Rectangle2d, resizeBox, ShapeProps, ShapeUtil, T, TLOnResizeHandler } from '@tldraw/tldraw';
import { TranscludeComponent } from './component';
import { TranscludeShape } from './type';

export class TranscludeShapeUtil extends ShapeUtil<TranscludeShape> {
  static override type = 'transclude' as const;
  override isAspectRatioLocked = (_shape: TranscludeShape) => false;
  override canResize = (_shape: TranscludeShape) => true;
  override canBind = (_shape: TranscludeShape) => true;
  override canEdit = () => true;

  static override props: ShapeProps<TranscludeShape> = {
    color: DefaultColorStyle,
    field: T.optional(T.string),
    h: T.number,
    title: T.optional(T.string),
    w: T.number,
  };

  getDefaultProps(): TranscludeShape['props'] {
    return {
      w: 100,
      h: 100,
      color: 'grey',
    };
  }

  getGeometry(shape: TranscludeShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: TranscludeShape) {
    return <TranscludeComponent shape={shape} />;
  }

  indicator(shape: TranscludeShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize: TLOnResizeHandler<TranscludeShape> = (shape, info) => {
    return resizeBox(shape, info);
  };
}
