import { HTMLContainer, TLBounds, Utils } from '@tldraw/core';
import { Vec } from '@tldraw/vec';
import * as React from 'react';
import { useWidget } from 'tw-react';
import type { ITiddlerParseTreeNode } from 'tiddlywiki';

import { stopPropagation } from '@tldr/components/stopPropagation';
import { GHOSTED_OPACITY, LETTER_SPACING } from '@tldr/constants';
import { TLDR } from '@tldr/state/TLDR';
import { TDShapeUtil } from '@tldr/state/shapes/TDShapeUtil';
import {
  TextAreaUtils,
  defaultTextStyle,
  getBoundsRectangle,
  getFontFace,
  getStickyFontSize,
  getStickyFontStyle,
  getStickyShapeStyle,
  getTextSvgElement,
  transformSingleRectangle,
  transformRectangle,
} from '@tldr/state/shapes/shared';
import { styled } from '@tldr/styles';
import { AlignStyle, StickyShape, TDMeta, TDShapeType, TransformInfo } from '@tldr/types';

type T = StickyShape;
type E = HTMLDivElement;

export class StickyUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Sticky as const;

  canBind = true;

  canEdit = true;

  canClone = true;

  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'id',
        type: TDShapeType.Sticky,
        name: 'Sticky',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        size: [300, 300],
        text: '',
        rotation: 0,
        style: defaultTextStyle,
      },
      props,
    );
  };

  Component = TDShapeUtil.Component<T, E, TDMeta>(({ shape, meta, events, isGhost, isBinding, isEditing, onShapeBlur, onShapeChange }, reference) => {
    const font = getStickyFontStyle(shape.style);

    const { color, fill } = getStickyShapeStyle(shape.style);

    const rContainer = React.useRef<HTMLDivElement>(null);
    const rTextArea = React.useRef<HTMLTextAreaElement>(null);
    const rRenderedText = React.useRef<HTMLDivElement>(null);
    const rIsMounted = React.useRef(false);

    const handlePointerDown = React.useCallback((event: React.PointerEvent) => {
      event.stopPropagation();
    }, []);

    const astNode = React.useMemo<ITiddlerParseTreeNode>(() => {
      const childTree = $tw.wiki.parseText('text/vnd.tiddlywiki', shape.text).tree;
      return { type: 'tiddler', children: childTree };
    }, [shape.text]);
    useWidget(astNode, rRenderedText, { skip: isEditing });

    const onChange = React.useCallback(
      (text: string) => {
        onShapeChange?.({
          id: shape.id,
          type: shape.type,
          text: TLDR.normalizeText(text),
        });
      },
      [onShapeChange, shape.id, shape.type],
    );

    const handleTextChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.currentTarget.value);
      },
      [onChange],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onShapeBlur?.();
          return;
        }

        if (event.key === 'Tab' && shape.text.length === 0) {
          event.preventDefault();
          return;
        }

        if (!(event.key === 'Meta' || event.metaKey)) {
          event.stopPropagation();
        } else if (event.key === 'z' && event.metaKey) {
          if (event.shiftKey) {
            document.execCommand('redo', false);
          } else {
            document.execCommand('undo', false);
          }
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === '=') {
          event.preventDefault();
        }
        if (event.key === 'Tab') {
          event.preventDefault();
          if (event.shiftKey) {
            TextAreaUtils.unindent(event.currentTarget);
          } else {
            TextAreaUtils.indent(event.currentTarget);
          }

          onShapeChange?.({ ...shape, text: TLDR.normalizeText(event.currentTarget.value) });
        }
      },
      [shape, onShapeBlur, onShapeChange],
    );

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.currentTarget.setSelectionRange(0, 0);
        onShapeBlur?.();
      },
      [onShapeBlur],
    );

    const handleFocus = React.useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        if (!isEditing) return;
        if (!rIsMounted.current) return;
        event.currentTarget.select();
      },
      [isEditing],
    );

    // Focus when editing changes to true
    React.useEffect(() => {
      if (isEditing) {
        rIsMounted.current = true;
        const elm = rTextArea.current!;
        elm.focus();
        elm.select();
      }
    }, [isEditing]);

    // Resize to fit text
    // React.useEffect(() => {
    //   const text = rText.current!;

    //   const { size } = shape;
    //   const { offsetHeight: currTextHeight } = text;
    //   const minTextHeight = MIN_CONTAINER_HEIGHT - PADDING * 2;
    //   const prevTextHeight = size[1] - PADDING * 2;

    //   // Same size? We can quit here
    //   if (currTextHeight === prevTextHeight) return;

    //   if (currTextHeight > minTextHeight) {
    //     // Snap the size to the text content if the text only when the
    //     // text is larger than the minimum text height.
    //     onShapeChange?.({ id: shape.id, size: [size[0], currTextHeight + PADDING * 2] });
    //     return;
    //   }

    //   if (currTextHeight < minTextHeight && size[1] > MIN_CONTAINER_HEIGHT) {
    //     // If we're smaller than the minimum height and the container
    //     // is too tall, snap it down to the minimum container height
    //     onShapeChange?.({ id: shape.id, size: [size[0], MIN_CONTAINER_HEIGHT] });
    //     return;
    //   }

    //   const textarea = rTextArea.current;
    //   textarea?.focus();
    // }, [shape.text, shape.size[1], shape.style]);

    const style = {
      font,
      color,
      textShadow: `0.5px 0.5px 2px rgba(255, 255, 255,.5)`,
    };

    return (
      <HTMLContainer ref={reference} {...events}>
        <StyledStickyContainer ref={rContainer} isGhost={isGhost} style={{ backgroundColor: fill, ...style }}>
          {isBinding && (
            <div
              className="tl-binding-indicator"
              style={{
                position: 'absolute',
                top: -this.bindingDistance,
                left: -this.bindingDistance,
                width: `calc(100% + ${this.bindingDistance * 2}px)`,
                height: `calc(100% + ${this.bindingDistance * 2}px)`,
                backgroundColor: 'var(--tl-selectFill)',
              }}
            />
          )}
          <StyledText ref={rRenderedText} isEditing={isEditing} alignment={shape.style.textAlign}></StyledText>
          {isEditing && (
            <StyledTextArea
              ref={rTextArea}
              onPointerDown={handlePointerDown}
              value={shape.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              tabIndex={-1}
              autoComplete="false"
              autoCapitalize="false"
              autoCorrect="false"
              autoSave="false"
              autoFocus
              spellCheck={true}
              alignment={shape.style.textAlign}
              onContextMenu={stopPropagation}
              onCopy={stopPropagation}
              onPaste={stopPropagation}
              onCut={stopPropagation}
            />
          )}
        </StyledStickyContainer>
      </HTMLContainer>
    );
  });

  Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
    const {
      size: [width, height],
    } = shape;

    return <rect x={0} y={0} rx={3} ry={3} width={Math.max(1, width)} height={Math.max(1, height)} />;
  });

  getBounds = (shape: T) => {
    return getBoundsRectangle(shape, this.boundsCache);
  };

  shouldRender = (previous: T, next: T) => {
    return next.size !== previous.size || next.style !== previous.style || next.text !== previous.text;
  };

  transform = transformRectangle;

  transformSingle = transformSingleRectangle;

  getSvgElement = (shape: T): SVGElement | void => {
    const bounds = this.getBounds(shape);

    const style = getStickyShapeStyle(shape.style);

    const fontSize = getStickyFontSize(shape.style.size) * (shape.style.scale ?? 1);
    const fontFamily = getFontFace(shape.style.font).slice(1, -1);
    const textAlign = shape.style.textAlign ?? AlignStyle.Start;

    const textElm = getTextSvgElement(shape.text, fontSize, fontFamily, textAlign, bounds.width - PADDING * 2, true);

    textElm.setAttribute('fill', style.color);
    textElm.setAttribute('transform', `translate(${PADDING}, ${PADDING})`);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', String(bounds.width));
    rect.setAttribute('height', String(bounds.height));
    rect.setAttribute('fill', style.fill);
    rect.setAttribute('rx', '3');
    rect.setAttribute('ry', '3');

    g.appendChild(rect);
    g.appendChild(textElm);

    return g;
  };
}

/* -------------------------------------------------- */
/*                       Helpers                      */
/* -------------------------------------------------- */

const PADDING = 16;
const MIN_CONTAINER_HEIGHT = 300;

const StyledStickyContainer = styled('div', {
  pointerEvents: 'all',
  position: 'relative',
  backgroundColor: 'transparent',
  height: '100%',
  width: '100%',
  padding: `${PADDING}px`,
  borderRadius: '3px',
  perspective: '800px',
  variants: {
    isGhost: {
      false: { opacity: 1 },
      true: { transition: 'opacity .2s', opacity: GHOSTED_OPACITY },
    },
  },
});

const commonTextWrapping = {
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  letterSpacing: LETTER_SPACING,
};

const StyledText = styled('div', {
  position: 'absolute',
  top: PADDING,
  left: PADDING,
  width: `calc(100% - ${PADDING * 2}px)`,
  height: 'fit-content',
  font: 'inherit',
  pointerEvents: 'none',
  userSelect: 'none',
  variants: {
    isEditing: {
      true: {
        opacity: 0,
      },
      false: {
        opacity: 1,
      },
    },
    alignment: {
      [AlignStyle.Start]: {
        textAlign: 'left',
      },
      [AlignStyle.Middle]: {
        textAlign: 'center',
      },
      [AlignStyle.End]: {
        textAlign: 'right',
      },
      [AlignStyle.Justify]: {
        textAlign: 'justify',
      },
    },
  },
  ...commonTextWrapping,
});

const StyledTextArea = styled('textarea', {
  width: '100%',
  height: '100%',
  border: 'none',
  overflow: 'hidden',
  background: 'none',
  outline: 'none',
  textAlign: 'left',
  font: 'inherit',
  padding: 0,
  color: '#333',
  verticalAlign: 'top',
  resize: 'none',
  caretColor: 'black',
  ...commonTextWrapping,
  variants: {
    alignment: {
      [AlignStyle.Start]: {
        textAlign: 'left',
      },
      [AlignStyle.Middle]: {
        textAlign: 'center',
      },
      [AlignStyle.End]: {
        textAlign: 'right',
      },
      [AlignStyle.Justify]: {
        textAlign: 'justify',
      },
    },
  },
  '&:focus': {
    outline: 'none',
    border: 'none',
  },
});
