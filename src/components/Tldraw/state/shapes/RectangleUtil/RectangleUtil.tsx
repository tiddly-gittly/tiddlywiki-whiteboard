import { SVGContainer, Utils } from '@tldraw/core';
import * as React from 'react';
import { GHOSTED_OPACITY, LABEL_POINT } from '@tldr/constants';
import { TDShapeUtil } from '@tldr/state/shapes/TDShapeUtil';
import {
  TextLabel,
  defaultStyle,
  getBoundsRectangle,
  getFontStyle,
  getShapeStyle,
  transformRectangle,
  transformSingleRectangle,
} from '@tldr/state/shapes/shared';
import { styled } from '@tldr/styles';
import { DashStyle, RectangleShape, TDMeta, TDShapeType } from '@tldr/types';
import { BindingIndicator } from './components/BindingIndicator';
import { DashedRectangle } from './components/DashedRectangle';
import { DrawRectangle } from './components/DrawRectangle';
import { getRectangleIndicatorPathTDSnapshot } from './rectangleHelpers';

type T = RectangleShape;
type E = HTMLDivElement;

export class RectangleUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Rectangle as const;

  canBind = true;

  canClone = true;

  canEdit = true;

  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'id',
        type: TDShapeType.Rectangle,
        name: 'Rectangle',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        size: [1, 1],
        rotation: 0,
        style: defaultStyle,
        label: '',
        labelPoint: [0.5, 0.5],
      },
      props,
    );
  };

  Component = TDShapeUtil.Component<T, E, TDMeta>(
    ({ shape, isEditing, isBinding, isSelected, isGhost, meta, bounds, events, onShapeBlur, onShapeChange }, reference) => {
      const { id, size, style, label = '', labelPoint = LABEL_POINT } = shape;
      const font = getFontStyle(style);
      const styles = getShapeStyle(style, meta.isDarkMode);
      const Component = style.dash === DashStyle.Draw ? DrawRectangle : DashedRectangle;
      const handleLabelChange = React.useCallback((label: string) => onShapeChange?.({ id, label }), [onShapeChange]);
      return (
        <FullWrapper ref={reference} {...events}>
          <TextLabel
            isEditing={isEditing}
            onChange={handleLabelChange}
            onBlur={onShapeBlur}
            font={font}
            text={label}
            color={styles.stroke}
            offsetX={(labelPoint[0] - 0.5) * bounds.width}
            offsetY={(labelPoint[1] - 0.5) * bounds.height}
          />
          <SVGContainer id={shape.id + '_svg'} opacity={isGhost ? GHOSTED_OPACITY : 1}>
            {isBinding && <BindingIndicator strokeWidth={styles.strokeWidth} size={size} />}
            <Component id={id} style={style} size={size} isSelected={isSelected} isDarkMode={meta.isDarkMode} />
          </SVGContainer>
        </FullWrapper>
      );
    },
  );

  Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
    const { id, style, size } = shape;

    const styles = getShapeStyle(style, false);
    const sw = styles.strokeWidth;

    if (style.dash === DashStyle.Draw) {
      return <path d={getRectangleIndicatorPathTDSnapshot(id, style, size)} />;
    }

    return <rect x={sw} y={sw} rx={1} ry={1} width={Math.max(1, size[0] - sw * 2)} height={Math.max(1, size[1] - sw * 2)} />;
  });

  getBounds = (shape: T) => {
    return getBoundsRectangle(shape, this.boundsCache);
  };

  shouldRender = (previous: T, next: T) => {
    return next.size !== previous.size || next.style !== previous.style || next.label !== previous.label;
  };

  transform = transformRectangle;

  transformSingle = transformSingleRectangle;
}

const FullWrapper = styled('div', { width: '100%', height: '100%' });
