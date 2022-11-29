import { Utils } from '@tldraw/core';
import Vec from '@tldraw/vec';
import * as React from 'react';
import { getShapeStyle } from '@tldr/state/shapes/shared';
import type { Decoration, ShapeStyles } from '@tldr/types';
import { getStraightArrowHeadPoints, renderFreehandArrowShaft } from '../arrowHelpers';
import { Arrowhead } from './ArrowHead';

interface ArrowSvgProps {
  arrowBend: number;
  bend: number[];
  decorationEnd: Decoration | undefined;
  decorationStart: Decoration | undefined;
  end: number[];
  id: string;
  isDraw: boolean;
  start: number[];
  style: ShapeStyles;
}

export const StraightArrow = React.memo(function StraightArrow({ id, style, start, end, decorationStart, decorationEnd, isDraw }: ArrowSvgProps) {
  const arrowDist = Vec.dist(start, end);
  if (arrowDist < 2) return null;
  const styles = getShapeStyle(style);
  const { strokeWidth } = styles;
  const sw = 1 + strokeWidth * 1.618;
  // Path between start and end points
  const path = isDraw ? renderFreehandArrowShaft(id, style, start, end, decorationStart, decorationEnd) : 'M' + Vec.toFixed(start) + 'L' + Vec.toFixed(end);
  const { strokeDasharray, strokeDashoffset } = Utils.getPerfectDashProps(arrowDist, strokeWidth * 1.618, style.dash, 2, false);
  // Arrowheads
  const arrowHeadLength = Math.min(arrowDist / 3, strokeWidth * 8);
  const startArrowHead = decorationStart ? getStraightArrowHeadPoints(start, end, arrowHeadLength) : null;
  const endArrowHead = decorationEnd ? getStraightArrowHeadPoints(end, start, arrowHeadLength) : null;
  return (
    <>
      <path className="tl-stroke-hitarea" d={path} />
      <path
        d={path}
        fill={styles.stroke}
        stroke={styles.stroke}
        strokeWidth={isDraw ? sw / 2 : sw}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="stroke"
      />
      {startArrowHead && <Arrowhead left={startArrowHead.left} middle={start} right={startArrowHead.right} stroke={styles.stroke} strokeWidth={sw} />}
      {endArrowHead && <Arrowhead left={endArrowHead.left} middle={end} right={endArrowHead.right} stroke={styles.stroke} strokeWidth={sw} />}
    </>
  );
});
