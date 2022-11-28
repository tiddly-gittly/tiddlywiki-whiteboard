import { Utils } from '@tldraw/core';
import Vec from '@tldraw/vec';
import * as React from 'react';
import { EASINGS } from '@tldr/constants';
import { getShapeStyle } from '@tldr/state/shapes/shared';
import type { Decoration, ShapeStyles } from '@tldr/types';
import { getArcLength, getArrowArcPath, getCtp, getCurvedArrowHeadPoints, renderCurvedFreehandArrowShaft } from '../arrowHelpers';
import { Arrowhead } from './ArrowHead';

interface ArrowSvgProps {
  arrowBend: number;
  bend: number[];
  decorationEnd: Decoration | undefined;
  decorationStart: Decoration | undefined;
  end: number[];
  id: string;
  isDarkMode: boolean;
  isDraw: boolean;
  start: number[];
  style: ShapeStyles;
}

export const CurvedArrow = React.memo(function CurvedArrow({
  id,
  style,
  start,
  bend,
  end,
  arrowBend,
  decorationStart,
  decorationEnd,
  isDraw,
  isDarkMode,
}: ArrowSvgProps) {
  const arrowDistribution = Vec.dist(start, end);
  if (arrowDistribution < 2) return null;
  const styles = getShapeStyle(style, isDarkMode);
  const { strokeWidth } = styles;
  const sw = 1 + strokeWidth * 1.618;
  // Calculate a path as a segment of a circle passing through the three points start, bend, and end
  const circle = getCtp(start, bend, end);
  const center = [circle[0], circle[1]];
  const radius = circle[2];
  const length = getArcLength(center, radius, start, end);
  const getRandom = Utils.rng(id);
  const easing = EASINGS[getRandom() > 0 ? 'easeInOutSine' : 'easeInOutCubic'];
  const path = isDraw
    ? renderCurvedFreehandArrowShaft(id, style, start, end, decorationStart, decorationEnd, center, radius, length, easing)
    : getArrowArcPath(start, end, circle, arrowBend);
  const { strokeDasharray, strokeDashoffset } = Utils.getPerfectDashProps(Math.abs(length), sw, style.dash, 2, false);
  // Arrowheads
  const arrowHeadLength = Math.min(arrowDistribution / 3, strokeWidth * 8);
  const startArrowHead = decorationStart ? getCurvedArrowHeadPoints(start, arrowHeadLength, center, radius, length < 0) : null;
  const endArrowHead = decorationEnd ? getCurvedArrowHeadPoints(end, arrowHeadLength, center, radius, length >= 0) : null;
  return (
    <>
      <path className="tl-stroke-hitarea" d={path} />
      <path
        d={path}
        fill={isDraw ? styles.stroke : 'none'}
        stroke={styles.stroke}
        strokeWidth={isDraw ? 0 : sw}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
      {startArrowHead != undefined && (
        <Arrowhead left={startArrowHead.left} middle={start} right={startArrowHead.right} stroke={styles.stroke} strokeWidth={sw} />
      )}
      {endArrowHead != undefined && <Arrowhead left={endArrowHead.left} middle={end} right={endArrowHead.right} stroke={styles.stroke} strokeWidth={sw} />}
    </>
  );
});