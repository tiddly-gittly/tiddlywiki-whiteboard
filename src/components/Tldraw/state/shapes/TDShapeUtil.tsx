import { TLShapeUtil, Utils } from '@tldraw/core';
import type { TLBounds, TLPointerInfo } from '@tldraw/core';
import { intersectLineSegmentBounds, intersectLineSegmentPolyline, intersectRayBounds } from '@tldraw/intersect';
import { Vec } from '@tldraw/vec';
import * as React from 'react';
import { BINDING_DISTANCE } from '../../constants';
import { AlignStyle, ShapesWithProp, TDBinding, TDMeta, TDShape, TransformInfo } from '../../types';
import { getFontFace, getFontSize, getFontStyle, getShapeStyle } from './shared';
import { getTextLabelSize } from './shared/getTextSize';
import { getTextSvgElement } from './shared/getTextSvgElement';

export abstract class TDShapeUtil<T extends TDShape, E extends Element = any> extends TLShapeUtil<T, E, TDMeta> {
  abstract type: T['type'];

  canBind = false;

  canEdit = false;

  canClone = false;

  isAspectRatioLocked = false;

  hideResizeHandles = false;

  bindingDistance = BINDING_DISTANCE;

  abstract getShape: (props: Partial<T>) => T;

  hitTestPoint = (shape: T, point: number[]): boolean => {
    return Utils.pointInBounds(point, this.getRotatedBounds(shape));
  };

  hitTestLineSegment = (shape: T, A: number[], B: number[]): boolean => {
    const box = Utils.getBoundsFromPoints([A, B]);
    const bounds = this.getBounds(shape);

    return Utils.boundsContain(bounds, box) || Boolean(shape.rotation)
      ? intersectLineSegmentPolyline(A, B, Utils.getRotatedCorners(this.getBounds(shape))).didIntersect
      : intersectLineSegmentBounds(A, B, this.getBounds(shape)).length > 0;
  };

  create = (props: { id: string } & Partial<T>) => {
    this.refMap.set(props.id, React.createRef());
    return this.getShape(props);
  };

  getCenter = (shape: T) => {
    return Utils.getBoundsCenter(this.getBounds(shape));
  };

  getExpandedBounds = (shape: T) => {
    return Utils.expandBounds(this.getBounds(shape), this.bindingDistance);
  };

  getBindingPoint = <K extends TDShape>(shape: T, fromShape: K, point: number[], origin: number[], direction: number[], bindAnywhere: boolean) => {
    // Algorithm time! We need to find the binding point (a normalized point inside of the shape, or around the shape, where the arrow will point to) and the distance from the binding shape to the anchor.

    const bounds = this.getBounds(shape);
    const expandedBounds = this.getExpandedBounds(shape);

    // The point must be inside of the expanded bounding box
    if (!Utils.pointInBounds(point, expandedBounds)) return;

    const intersections = intersectRayBounds(origin, direction, expandedBounds)
      .filter((int) => int.didIntersect)
      .map((int) => int.points[0]);

    if (intersections.length === 0) return;

    // The center of the shape
    const center = this.getCenter(shape);

    // Find furthest intersection between ray from origin through point and expanded bounds. TODO: What if the shape has a curve? In that case, should we intersect the circle-from-three-points instead?
    const intersection = intersections.sort((a, b) => Vec.dist(b, origin) - Vec.dist(a, origin))[0];

    // The point between the handle and the intersection
    const middlePoint = Vec.med(point, intersection);

    // The anchor is the point in the shape where the arrow will be pointing
    let anchor: number[];

    // The distance is the distance from the anchor to the handle
    let distance: number;

    if (bindAnywhere) {
      // If the user is indicating that they want to bind inside of the shape, we just use the handle's point
      anchor = Vec.dist(point, center) < BINDING_DISTANCE / 2 ? center : point;
      distance = 0;
    } else {
      if (Vec.distanceToLineSegment(point, middlePoint, center) < BINDING_DISTANCE / 2) {
        // If the line segment would pass near to the center, snap the anchor the center point
        anchor = center;
      } else {
        // Otherwise, the anchor is the middle point between the handle and the intersection
        anchor = middlePoint;
      }

      if (Utils.pointInBounds(point, bounds)) {
        // If the point is inside of the shape, use the shape's binding distance

        distance = this.bindingDistance;
      } else {
        // Otherwise, use the actual distance from the handle point to nearest edge
        distance = Math.max(
          this.bindingDistance,
          Utils.getBoundsSides(bounds)
            .map((side) => Vec.distanceToLineSegment(side[1][0], side[1][1], point))
            .sort((a, b) => a - b)[0],
        );
      }
    }

    // The binding point is a normalized point indicating the position of the anchor.
    // An anchor at the middle of the shape would be (0.5, 0.5). When the shape's bounds
    // changes, we will re-recalculate the actual anchor point by multiplying the
    // normalized point by the shape's new bounds.
    const bindingPoint = Vec.divV(Vec.sub(anchor, [expandedBounds.minX, expandedBounds.minY]), [expandedBounds.width, expandedBounds.height]);

    return {
      point: Vec.clampV(bindingPoint, 0, 1),
      distance,
    };
  };

  mutate = (shape: T, props: Partial<T>): Partial<T> => {
    return props;
  };

  transform = (shape: T, bounds: TLBounds, info: TransformInfo<T>): Partial<T> => {
    return { ...shape, point: [bounds.minX, bounds.minY] };
  };

  transformSingle = (shape: T, bounds: TLBounds, info: TransformInfo<T>): Partial<T> | undefined => {
    return this.transform(shape, bounds, info);
  };

  updateChildren?: <K extends TDShape>(shape: T, children: K[]) => Array<Partial<K>> | undefined;

  onChildrenChange?: (shape: T, children: TDShape[]) => Partial<T> | undefined;

  onHandleChange?: (shape: T, handles: Partial<T['handles']>) => Partial<T> | undefined;

  onRightPointHandle?: (shape: T, handles: Partial<T['handles']>, info: Partial<TLPointerInfo>) => Partial<T> | undefined;

  onDoubleClickHandle?: (shape: T, handles: Partial<T['handles']>, info: Partial<TLPointerInfo>) => Partial<T> | undefined;

  onDoubleClickBoundsHandle?: (shape: T) => Partial<T> | undefined;

  onSessionComplete?: (shape: T) => Partial<T> | undefined;

  getSvgElement = (shape: T, isDarkMode: boolean): SVGElement | undefined => {
    // eslint-disable-next-line unicorn/prefer-query-selector
    const elm = document.getElementById(shape.id + '_svg')?.cloneNode(true) as SVGElement;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!elm) return; // possibly in test mode
    const hasLabel = (shape.label?.trim()?.length ?? 0) > 0;
    if (hasLabel) {
      const s = shape as TDShape & { label: string };
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const font = getFontStyle(shape.style);
      const labelSize = getTextLabelSize(shape.label!, font);
      const fontSize = getFontSize(shape.style.size, shape.style.font) * (shape.style.scale ?? 1);
      const fontFamily = getFontFace(shape.style.font).slice(1, -1);

      const labelElm = getTextSvgElement(s.label, fontSize, fontFamily, AlignStyle.Middle, labelSize[0], false);

      const bounds = this.getBounds(shape);

      labelElm.setAttribute('transform', `translate(${bounds.width / 2 - labelSize[0] / 2}, ${bounds.height / 2 - labelSize[1] / 2})`);
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
