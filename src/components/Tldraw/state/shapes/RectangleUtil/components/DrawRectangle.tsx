import * as React from 'react';
import { getShapeStyle } from '@tldr/state/shapes/shared';
import type { ShapeStyles } from '@tldr/types';
import { getRectangleIndicatorPathTDSnapshot, getRectanglePath } from '../rectangleHelpers';

interface RectangleSvgProps {
  id: string;
  isSelected: boolean;
  size: number[];
  style: ShapeStyles;
}

export const DrawRectangle = React.memo(function DrawRectangle({ id, style, size, isSelected }: RectangleSvgProps) {
  const { isFilled } = style;
  const { stroke, strokeWidth, fill } = getShapeStyle(style);
  const pathTDSnapshot = getRectanglePath(id, style, size);
  const innerPath = getRectangleIndicatorPathTDSnapshot(id, style, size);

  return (
    <>
      <path className={style.isFilled || isSelected ? 'tl-fill-hitarea' : 'tl-stroke-hitarea'} d={innerPath} />
      {isFilled && <path d={innerPath} fill={fill} pointerEvents="none" />}
      <path d={pathTDSnapshot} fill={stroke} stroke={stroke} strokeWidth={strokeWidth} pointerEvents="none" />
    </>
  );
});
