import * as React from 'react';
import { getShapeStyle } from '@tldr/state/shapes/shared';
import type { ShapeStyles } from '@tldr/types';
import { getEllipseIndicatorPath, getEllipsePath } from '../ellipseHelpers';

interface EllipseSvgProps {
  id: string;
  isDarkMode: boolean;
  isSelected: boolean;
  radius: number[];
  style: ShapeStyles;
}

export const DrawEllipse = React.memo(function DrawEllipse({ id, radius, style, isSelected, isDarkMode }: EllipseSvgProps) {
  const { stroke, strokeWidth, fill } = getShapeStyle(style, isDarkMode);
  const innerPath = getEllipsePath(id, radius, style);

  return (
    <>
      <ellipse className={style.isFilled || isSelected ? 'tl-fill-hitarea' : 'tl-stroke-hitarea'} cx={radius[0]} cy={radius[1]} rx={radius[0]} ry={radius[1]} />
      {style.isFilled && <path d={getEllipseIndicatorPath(id, radius, style)} stroke="none" fill={fill} pointerEvents="none" />}
      <path d={innerPath} fill={stroke} stroke={stroke} strokeWidth={strokeWidth} pointerEvents="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
});
