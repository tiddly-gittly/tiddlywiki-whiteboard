import { Utils } from '@tldraw/core';
import * as React from 'react';
import { BINDING_DISTANCE } from '@tldr/constants';
import { getShapeStyle } from '@tldr/state/shapes/shared';
import type { ShapeStyles } from '@tldr/types';

interface RectangleSvgProps {
  id: string;
  isDarkMode: boolean;
  isSelected: boolean;
  size: number[];
  style: ShapeStyles;
}

export const DashedRectangle = React.memo(function DashedRectangle({ id, style, size, isSelected, isDarkMode }: RectangleSvgProps) {
  const { stroke, strokeWidth, fill } = getShapeStyle(style, isDarkMode);

  const sw = 1 + strokeWidth * 1.618;

  const w = Math.max(0, size[0] - sw / 2);
  const h = Math.max(0, size[1] - sw / 2);

  const strokes: Array<[number[], number[], number]> = [
    [[sw / 2, sw / 2], [w, sw / 2], w - sw / 2],
    [[w, sw / 2], [w, h], h - sw / 2],
    [[w, h], [sw / 2, h], w - sw / 2],
    [[sw / 2, h], [sw / 2, sw / 2], h - sw / 2],
  ];

  const paths = strokes.map(([start, end, length], i) => {
    const { strokeDasharray, strokeDashoffset } = Utils.getPerfectDashProps(length, strokeWidth * 1.618, style.dash);

    return (
      <line key={id + '_' + i} x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
    );
  });

  return (
    <>
      <rect
        className={isSelected || style.isFilled ? 'tl-fill-hitarea' : 'tl-stroke-hitarea'}
        x={sw / 2}
        y={sw / 2}
        width={w}
        height={h}
        strokeWidth={BINDING_DISTANCE}
      />
      {style.isFilled && <rect x={sw / 2} y={sw / 2} width={w} height={h} fill={fill} pointerEvents="none" />}
      <g pointerEvents="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        {paths}
      </g>
    </>
  );
});
