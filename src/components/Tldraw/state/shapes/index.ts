import type { TDShapeUtil } from '@tldr/state/shapes/TDShapeUtil';
import { TDShape, TDShapeType } from '@tldr/types';
import { ArrowUtil } from './ArrowUtil';
import { DrawUtil } from './DrawUtil';
import { EllipseUtil } from './EllipseUtil';
import { GroupUtil } from './GroupUtil';
import { ImageUtil } from './ImageUtil';
import { RectangleUtil } from './RectangleUtil';
import { StickyUtil } from './StickyUtil';
import { TextUtil } from './TextUtil';
import { TriangleUtil } from './TriangleUtil';

export const Rectangle = new RectangleUtil();
export const Triangle = new TriangleUtil();
export const Ellipse = new EllipseUtil();
export const Draw = new DrawUtil();
export const Arrow = new ArrowUtil();
export const Text = new TextUtil();
export const Group = new GroupUtil();
export const Sticky = new StickyUtil();
export const Image = new ImageUtil();

export const shapeUtils = {
  [TDShapeType.Rectangle]: Rectangle,
  [TDShapeType.Triangle]: Triangle,
  [TDShapeType.Ellipse]: Ellipse,
  [TDShapeType.Draw]: Draw,
  [TDShapeType.Arrow]: Arrow,
  [TDShapeType.Text]: Text,
  [TDShapeType.Group]: Group,
  [TDShapeType.Sticky]: Sticky,
  [TDShapeType.Image]: Image,
};

export const getShapeUtil = <T extends TDShape>(shape: T | T['type']) => {
  if (typeof shape === 'string') return shapeUtils[shape] as unknown as TDShapeUtil<T>;
  return shapeUtils[shape.type] as unknown as TDShapeUtil<T>;
};
