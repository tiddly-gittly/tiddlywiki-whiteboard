import { SVGContainer, TLBounds, Utils } from '@tldraw/core';
import { intersectArcBounds, intersectLineSegmentBounds, intersectLineSegmentLineSegment } from '@tldraw/intersect';
import { Vec } from '@tldraw/vec';
import * as React from 'react';
import { GHOSTED_OPACITY } from '@tldr/constants';
import { TDShapeUtil } from '@tldr/state/shapes/TDShapeUtil';
import {
  LabelMask,
  TextLabel,
  defaultStyle,
  getFontFace,
  getFontSize,
  getFontStyle,
  getShapeStyle,
  getTextLabelSize,
  getTextSvgElement,
} from '@tldr/state/shapes/shared';
import { styled } from '@tldr/styles';
import { AlignStyle, ArrowShape, DashStyle, Decoration, TDMeta, TDShapeType, TransformInfo } from '@tldr/types';
import { getArcLength, getArcPoints, getArrowPath, getBendPoint, getCtp, isAngleBetween } from './arrowHelpers';
import { CurvedArrow } from './components/CurvedArrow.tsx';
import { StraightArrow } from './components/StraightArrow';

type T = ArrowShape;
type E = HTMLDivElement;

export class ArrowUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Arrow as const;

  hideBounds = true;

  canEdit = true;

  pathCache = new WeakMap<T, string>();

  getShape = (props: Partial<T>): T => {
    return {
      id: 'id',
      type: TDShapeType.Arrow,
      name: 'Arrow',
      parentId: 'page',
      childIndex: 1,
      point: [0, 0],
      rotation: 0,
      bend: 0,
      handles: {
        start: {
          id: 'start',
          index: 0,
          point: [0, 0],
          canBind: true,
          ...props.handles?.start,
        },
        end: {
          id: 'end',
          index: 1,
          point: [1, 1],
          canBind: true,
          ...props.handles?.end,
        },
        bend: {
          id: 'bend',
          index: 2,
          point: [0.5, 0.5],
          ...props.handles?.bend,
        },
      },
      decorations: props.decorations ?? {
        end: Decoration.Arrow,
      },
      style: {
        ...defaultStyle,
        isFilled: false,
        ...props.style,
      },
      label: '',
      labelPoint: [0.5, 0.5],
      ...props,
    };
  };

  Component = TDShapeUtil.Component<T, E, TDMeta>(({ shape, isEditing, isGhost, meta, events, onShapeChange, onShapeBlur }, reference) => {
    const {
      id,
      label = '',
      handles: { start, bend, end },
      decorations = {},
      style,
    } = shape;

    const hasLabel = label?.trim()?.length ?? 0 > 0;

    const isStraightLine = Vec.dist(bend.point, Vec.toFixed(Vec.med(start.point, end.point))) < 1;

    const font = getFontStyle(style);

    const styles = getShapeStyle(style, meta.isDarkMode);

    const labelSize = hasLabel || isEditing ? getTextLabelSize(label, font) : [0, 0];

    const bounds = this.getBounds(shape);

    const distribution = React.useMemo(() => {
      const { start, bend, end } = shape.handles;
      if (isStraightLine) return Vec.dist(start.point, end.point);
      const circle = getCtp(start.point, bend.point, end.point);
      const center = circle.slice(0, 2);
      const radius = circle[2];
      const length = getArcLength(center, radius, start.point, end.point);
      return Math.abs(length);
    }, [shape.handles]);

    const scale = Math.max(0.5, Math.min(1, Math.max(distribution / (labelSize[1] + 128), distribution / (labelSize[0] + 128))));

    const offset = React.useMemo(() => {
      const bounds = this.getBounds(shape);
      const offset = Vec.sub(shape.handles.bend.point, Vec.toFixed([bounds.width / 2, bounds.height / 2]));
      return offset;
    }, [shape, scale]);

    const handleLabelChange = React.useCallback(
      (label: string) => {
        onShapeChange?.({ id, label });
      },
      [onShapeChange],
    );

    const Component = isStraightLine ? StraightArrow : CurvedArrow;

    return (
      <FullWrapper ref={reference} {...events}>
        <TextLabel
          font={font}
          text={label}
          color={styles.stroke}
          offsetX={offset[0]}
          offsetY={offset[1]}
          scale={scale}
          isEditing={isEditing}
          onChange={handleLabelChange}
          onBlur={onShapeBlur}
        />
        <SVGContainer id={shape.id + '_svg'}>
          <defs>
            <mask id={shape.id + '_clip'}>
              <rect x={-100} y={-100} width={bounds.width + 200} height={bounds.height + 200} fill="white" />
              <rect
                x={bounds.width / 2 - (labelSize[0] / 2) * scale + offset[0]}
                y={bounds.height / 2 - (labelSize[1] / 2) * scale + offset[1]}
                width={labelSize[0] * scale}
                height={labelSize[1] * scale}
                rx={4 * scale}
                ry={4 * scale}
                fill="black"
                opacity={1}
              />
            </mask>
          </defs>
          <g pointerEvents="none" opacity={isGhost ? GHOSTED_OPACITY : 1} mask={hasLabel || isEditing ? `url(#${shape.id}_clip)` : ``}>
            <Component
              id={id}
              style={style}
              start={start.point}
              end={end.point}
              bend={bend.point}
              arrowBend={shape.bend}
              decorationStart={decorations?.start}
              decorationEnd={decorations?.end}
              isDraw={style.dash === DashStyle.Draw}
              isDarkMode={meta.isDarkMode}
            />
          </g>
        </SVGContainer>
      </FullWrapper>
    );
  });

  Indicator = TDShapeUtil.Indicator<ArrowShape>(({ shape, bounds }) => {
    const {
      style,
      decorations,
      label,
      handles: { start, bend, end },
    } = shape;

    const hasLabel = label?.trim()?.length ?? 0 > 0;

    const font = getFontStyle(style);
    const labelSize = hasLabel ? getTextLabelSize(label, font) : [0, 0];
    const isStraightLine = Vec.dist(bend.point, Vec.toFixed(Vec.med(start.point, end.point))) < 1;

    const distribution = React.useMemo(() => {
      const { start, bend, end } = shape.handles;
      if (isStraightLine) return Vec.dist(start.point, end.point);
      const circle = getCtp(start.point, bend.point, end.point);
      const center = circle.slice(0, 2);
      const radius = circle[2];
      const length = getArcLength(center, radius, start.point, end.point);
      return Math.abs(length);
    }, [shape.handles]);

    const scale = Math.max(0.5, Math.min(1, Math.max(distribution / (labelSize[1] + 128), distribution / (labelSize[0] + 128))));

    const offset = React.useMemo(() => {
      const bounds = this.getBounds(shape);
      const offset = Vec.sub(shape.handles.bend.point, [bounds.width / 2, bounds.height / 2]);
      return offset;
    }, [shape, scale]);

    return (
      <>
        {hasLabel && <LabelMask id={shape.id} scale={scale} offset={offset} bounds={bounds} labelSize={labelSize} />}
        <path
          d={getArrowPath(style, start.point, bend.point, end.point, decorations?.start, decorations?.end)}
          mask={hasLabel ? `url(#${shape.id}_clip)` : ``}
        />
        {hasLabel && (
          <rect
            x={bounds.width / 2 - (labelSize[0] / 2) * scale + offset[0]}
            y={bounds.height / 2 - (labelSize[1] / 2) * scale + offset[1]}
            width={labelSize[0] * scale}
            height={labelSize[1] * scale}
            rx={4 * scale}
            ry={4 * scale}
            fill="transparent"
          />
        )}
      </>
    );
  });

  getBounds = (shape: T) => {
    const bounds = Utils.getFromCache(this.boundsCache, shape, () => {
      const {
        handles: { start, bend, end },
      } = shape;
      return Utils.getBoundsFromPoints(getArcPoints(start.point, bend.point, end.point));
    });
    return Utils.translateBounds(bounds, shape.point);
  };

  getRotatedBounds = (shape: T) => {
    const {
      handles: { start, bend, end },
    } = shape;
    let points = getArcPoints(start.point, bend.point, end.point);
    const { minX, minY, maxX, maxY } = Utils.getBoundsFromPoints(points);
    if (shape.rotation !== 0) {
      points = points.map((pt) => Vec.rotWith(pt, [(minX + maxX) / 2, (minY + maxY) / 2], shape.rotation || 0));
    }

    return Utils.translateBounds(Utils.getBoundsFromPoints(points), shape.point);
  };

  getCenter = (shape: T) => {
    const { start, end } = shape.handles;
    return Vec.add(shape.point, Vec.med(start.point, end.point));
  };

  shouldRender = (previous: T, next: T) => {
    return next.decorations !== previous.decorations || next.handles !== previous.handles || next.style !== previous.style || next.label !== previous.label;
  };

  hitTestPoint = (shape: T, point: number[]): boolean => {
    const {
      handles: { start, bend, end },
    } = shape;
    const pt = Vec.sub(point, shape.point);
    const points = getArcPoints(start.point, bend.point, end.point);
    for (let index = 1; index < points.length; index++) {
      if (Vec.distanceToLineSegment(points[index - 1], points[index], pt) < 1) {
        return true;
      }
    }
    return false;
  };

  hitTestLineSegment = (shape: T, A: number[], B: number[]): boolean => {
    const {
      handles: { start, bend, end },
    } = shape;
    const ptA = Vec.sub(A, shape.point);
    const ptB = Vec.sub(B, shape.point);
    const points = getArcPoints(start.point, bend.point, end.point);
    for (let index = 1; index < points.length; index++) {
      if (intersectLineSegmentLineSegment(points[index - 1], points[index], ptA, ptB).didIntersect) {
        return true;
      }
    }
    return false;
  };

  hitTestBounds = (shape: T, bounds: TLBounds) => {
    const { start, end, bend } = shape.handles;
    const sp = Vec.add(shape.point, start.point);
    const ep = Vec.add(shape.point, end.point);
    if (Utils.pointInBounds(sp, bounds) || Utils.pointInBounds(ep, bounds)) {
      return true;
    }
    if (Vec.isEqual(Vec.med(start.point, end.point), bend.point)) {
      return intersectLineSegmentBounds(sp, ep, bounds).length > 0;
    } else {
      const [cx, cy, r] = getCtp(start.point, bend.point, end.point);
      const cp = Vec.add(shape.point, [cx, cy]);
      return intersectArcBounds(cp, r, sp, ep, bounds).length > 0;
    }
  };

  transform = (shape: T, bounds: TLBounds, { initialShape, scaleX, scaleY }: TransformInfo<T>): Partial<T> => {
    const initialShapeBounds = this.getBounds(initialShape);
    const handles: Array<keyof T['handles']> = ['start', 'end'];
    const nextHandles = { ...initialShape.handles };

    handles.forEach((handle) => {
      if (handle === 'bend') return;

      const [x, y] = nextHandles[handle].point;
      const nw = x / initialShapeBounds.width;
      const nh = y / initialShapeBounds.height;
      nextHandles[handle] = {
        ...nextHandles[handle],
        point: [bounds.width * (scaleX < 0 ? 1 - nw : nw), bounds.height * (scaleY < 0 ? 1 - nh : nh)],
      };
    });

    // If we've flipped one of the dimensions (but not both) then invert shape.bend

    const nextBend = (scaleX > 0 && scaleY < 0) || (scaleX < 0 && scaleY > 0) ? -initialShape.bend : initialShape.bend;

    // Find the position of the bend handle based on the new start / end handles and the new bend
    const bendPoint = getBendPoint(nextHandles, nextBend);
    nextHandles.bend.point = bendPoint;

    return {
      point: Vec.toFixed([bounds.minX, bounds.minY]),
      handles: nextHandles,
      bend: nextBend, // does this change?
    };
  };

  onDoubleClickHandle = (shape: T, handle: Partial<T['handles']>): Partial<T> | void => {
    switch (handle) {
      case 'bend': {
        return {
          bend: 0,
          handles: {
            ...shape.handles,
            bend: {
              ...shape.handles.bend,
              point: getBendPoint(shape.handles, shape.bend),
            },
          },
        };
      }
      case 'start': {
        return {
          decorations: {
            ...shape.decorations,
            start: shape.decorations?.start ? undefined : Decoration.Arrow,
          },
        };
      }
      case 'end': {
        return {
          decorations: {
            ...shape.decorations,
            end: shape.decorations?.end ? undefined : Decoration.Arrow,
          },
        };
      }
    }

    return this;
  };

  onHandleChange = (shape: T, handles: Partial<T['handles']>): Partial<T> | void => {
    let nextHandles = Utils.deepMerge<ArrowShape['handles']>(shape.handles, handles);
    let nextBend = shape.bend;

    nextHandles = Utils.deepMerge(nextHandles, {
      start: {
        point: Vec.toFixed(nextHandles.start.point),
      },
      end: {
        point: Vec.toFixed(nextHandles.end.point),
      },
    });

    // This will produce NaN values
    if (Vec.isEqual(nextHandles.start.point, nextHandles.end.point)) return;

    // If the user is moving the bend handle, we want to move the bend point
    if ('bend' in handles) {
      const { start, end, bend } = nextHandles;

      const distance = Vec.dist(start.point, end.point);
      const midPoint = Vec.med(start.point, end.point);
      const angle = Vec.angle(start.point, end.point);
      const u = Vec.uni(Vec.vec(start.point, end.point));

      // Create a line segment perendicular to the line between the start and end points
      const ap = Vec.add(midPoint, Vec.mul(Vec.per(u), distance));
      const bp = Vec.sub(midPoint, Vec.mul(Vec.per(u), distance));

      const bendPoint = Vec.nearestPointOnLineSegment(ap, bp, bend.point, true);

      // Find the distance between the midpoint and the nearest point on the
      // line segment to the bend handle's dragged point
      const bendDistribution = Vec.dist(midPoint, bendPoint);

      // The shape's "bend" is the ratio of the bend to the distance between
      // the start and end points. If the bend is below a certain amount, the
      // bend should be zero.
      const realBend = bendDistribution / (distance / 2);

      nextBend = Utils.clamp(realBend, -0.99, 0.99);

      // If the point is to the left of the line segment, we make the bend
      // negative, otherwise it's positive.
      const angleToBend = Vec.angle(start.point, bendPoint);

      // If resulting bend is low enough that the handle will snap to center,
      // then also snap the bend to center

      if (Vec.isEqual(midPoint, getBendPoint(nextHandles, nextBend))) {
        nextBend = 0;
      } else if (isAngleBetween(angle, angle + Math.PI, angleToBend)) {
        // Otherwise, fix the bend direction
        nextBend *= -1;
      }
    }

    const nextShape = {
      point: shape.point,
      bend: nextBend,
      handles: {
        ...nextHandles,
        bend: {
          ...nextHandles.bend,
          point: getBendPoint(nextHandles, nextBend),
        },
      },
    };

    // Zero out the handles to prevent handles with negative points. If a handle's x or y
    // is below zero, we need to move the shape left or up to make it zero.
    const topLeft = shape.point;

    const nextBounds = this.getBounds({ ...nextShape } as ArrowShape);

    const offset = Vec.sub([nextBounds.minX, nextBounds.minY], topLeft);

    if (!Vec.isEqual(offset, [0, 0])) {
      Object.values(nextShape.handles).forEach((handle) => {
        handle.point = Vec.toFixed(Vec.sub(handle.point, offset));
      });
      nextShape.point = Vec.toFixed(Vec.add(nextShape.point, offset));
    }

    return nextShape;
  };

  getSvgElement = (shape: ArrowShape, isDarkMode: boolean): SVGElement | void => {
    const elm = document.getElementById(shape.id + '_svg')?.cloneNode(true) as SVGElement;
    if (!elm) return; // possibly in test mode
    const hasLabel = shape.label?.trim()?.length ?? 0 > 0;
    if (hasLabel) {
      const s = shape;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const font = getFontStyle(shape.style);
      const labelSize = getTextLabelSize(shape.label!, font);
      const fontSize = getFontSize(shape.style.size, shape.style.font) * (shape.style.scale ?? 1);
      const fontFamily = getFontFace(shape.style.font).slice(1, -1);

      const labelElm = getTextSvgElement(s.label!, fontSize, fontFamily, AlignStyle.Start, labelSize[0], false);

      let distribution: number;

      const { start, bend, end } = shape.handles;
      const isStraightLine = Vec.dist(bend.point, Vec.toFixed(Vec.med(start.point, end.point))) < 1;
      if (isStraightLine) {
        distribution = Vec.dist(start.point, end.point);
      } else {
        const circle = getCtp(start.point, bend.point, end.point);
        const center = circle.slice(0, 2);
        const radius = circle[2];
        const length = getArcLength(center, radius, start.point, end.point);
        distribution = Math.abs(length);
      }

      const scale = Math.max(0.5, Math.min(1, Math.max(distribution / (labelSize[1] + 128), distribution / (labelSize[0] + 128))));
      const bounds = this.getBounds(shape);

      const offset = Vec.sub(shape.handles.bend.point, [bounds.width / 2, bounds.height / 2]);
      const x = bounds.width / 2 - (labelSize[0] / 2) * scale + offset[0];
      const y = bounds.height / 2 - (labelSize[1] / 2) * scale + offset[1];

      labelElm.setAttribute('transform', `translate(${x}, ${y})`);
      labelElm.setAttribute('fill', getShapeStyle(shape.style, isDarkMode).stroke);
      labelElm.setAttribute('transform-origin', 'center center');
      g.setAttribute('text-align', 'center');
      g.setAttribute('text-anchor', 'middle');
      g.appendChild(elm);
      g.appendChild(labelElm);
      return g;
    }
    return elm;
  };
}

const FullWrapper = styled('div', { width: '100%', height: '100%' });
