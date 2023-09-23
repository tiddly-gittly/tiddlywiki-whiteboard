import { Box2d, HTMLContainer, Rectangle2d, ShapeUtil, TLBaseShape } from '@tldraw/tldraw';

type WikiTextStickyShape = TLBaseShape<
  'WikiTextSticky',
  { h: number; w: number }
>;

export class WikiTextStickyShapeUtil extends ShapeUtil<WikiTextStickyShape> {
  static type = 'WikiTextSticky' as const;

  getDefaultProps(): WikiTextStickyShape['props'] {
    return {
      w: 100,
      h: 100,
    };
  }

  getBounds(shape: WikiTextStickyShape) {
    return new Box2d(0, 0, shape.props.w, shape.props.h);
  }

  component(shape: WikiTextStickyShape) {
    return <HTMLContainer>Hello</HTMLContainer>;
  }

  getGeometry(shape: WikiTextStickyShape) {
    return new Rectangle2d({ width: 100, height: 100, isFilled: true });
  }

  indicator(shape: WikiTextStickyShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
