/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  Editor,
  getDefaultColorTheme,
  noteShapeProps,
  Rectangle2d,
  ShapeUtil,
  SvgExportContext,
  TLDefaultFontStyle,
  TLDefaultSizeStyle,
  TLNoteShape,
  TLOnEditEndHandler,
  toDomPrecision,
} from '@tldraw/editor';

const NOTE_SIZE = 200;

const TEXT_PROPS = {
  lineHeight: 1.35,
  fontWeight: 'normal',
  fontVariant: 'normal',
  fontStyle: 'normal',
  padding: '0px',
  maxWidth: 'auto',
};
/** @public */
const LABEL_FONT_SIZES: Record<TLDefaultSizeStyle, number> = {
  s: 18,
  m: 22,
  l: 26,
  xl: 32,
};

/** @public */
const FONT_FAMILIES: Record<TLDefaultFontStyle, string> = {
  draw: 'var(--tl-font-draw)',
  sans: 'var(--tl-font-sans)',
  serif: 'var(--tl-font-serif)',
  mono: 'var(--tl-font-mono)',
};

export class WikiTextShapeUtil extends ShapeUtil<TLNoteShape> {
  static override type = 'wikitext' as const;
  static override props = noteShapeProps;

  override canEdit = () => true;
  // override hideResizeHandles = () => true;
  override hideSelectionBoundsFg = () => true;

  getDefaultProps(): TLNoteShape['props'] {
    // DEBUG: console
    console.log(`getDefaultProps`);
    return {
      color: 'grey',
      size: 'm',
      text: '',
      font: 'draw',
      align: 'middle',
      verticalAlign: 'middle',
      growY: 0,
      url: '',
    };
  }

  getHeight(shape: TLNoteShape) {
    return NOTE_SIZE + shape.props.growY;
  }

  getGeometry(shape: TLNoteShape) {
    const height = this.getHeight(shape);
    return new Rectangle2d({ width: NOTE_SIZE, height, isFilled: true });
  }

  component(shape: TLNoteShape) {
    const {
      id,
      type,
      props: { color, font, size, align, text, verticalAlign },
    } = shape;

    const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() });
    const adjustedColor = color === 'black' ? 'yellow' : color;
    // DEBUG: console theme
    console.log(`theme`, theme);

    return (
      <>
        <div
          style={{
            position: 'absolute',
            width: NOTE_SIZE,
            height: this.getHeight(shape),
          }}
        >
          <div
            className='tl-note__container'
            style={{
              color: theme[adjustedColor].solid,
              backgroundColor: theme[adjustedColor].solid,
            }}
          >
            <div className='tl-note__scrim' />
            aaa
          </div>
        </div>
      </>
    );
  }

  indicator(shape: TLNoteShape) {
    return (
      <rect
        rx='7'
        width={toDomPrecision(NOTE_SIZE)}
        height={toDomPrecision(this.getHeight(shape))}
      />
    );
  }

  override toSvg(shape: TLNoteShape, context: SvgExportContext) {
    // context.addExportDef(getFontDefForExport(shape.props.font));
    const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() });
    const bounds = this.editor.getShapeGeometry(shape).bounds;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const adjustedColor = shape.props.color === 'black' ? 'yellow' : shape.props.color;

    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect1.setAttribute('rx', '10');
    rect1.setAttribute('width', NOTE_SIZE.toString());
    rect1.setAttribute('height', bounds.height.toString());
    rect1.setAttribute('fill', theme[adjustedColor].solid);
    rect1.setAttribute('stroke', theme[adjustedColor].solid);
    rect1.setAttribute('stroke-width', '1');
    g.append(rect1);

    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect2.setAttribute('rx', '10');
    rect2.setAttribute('width', NOTE_SIZE.toString());
    rect2.setAttribute('height', bounds.height.toString());
    rect2.setAttribute('fill', theme.background);
    rect2.setAttribute('opacity', '.28');
    g.append(rect2);

    // TODO: add rendered wikitext
    // const textElm = getTextLabelSvgElement({
    //   editor: this.editor,
    //   shape,
    //   font: DefaultFontFamilies[shape.props.font],
    //   bounds,
    // });

    // textElm.setAttribute('fill', theme.text);
    // textElm.setAttribute('stroke', 'none');
    // g.append(textElm);

    return g;
  }

  // override onBeforeCreate = (next: TLNoteShape) => {
  //   return getGrowY(this.editor, next, next.props.growY);
  // };

  override onBeforeUpdate = (previous: TLNoteShape, next: TLNoteShape) => {
    if (
      previous.props.text === next.props.text &&
      previous.props.font === next.props.font &&
      previous.props.size === next.props.size
    ) {
      return;
    }

    return getGrowY(this.editor, next, previous.props.growY);
  };

  override onEditEnd: TLOnEditEndHandler<TLNoteShape> = (shape) => {
    const {
      id,
      type,
      props: { text },
    } = shape;

    if (text.trimEnd() !== text) {
      this.editor.updateShapes([
        {
          id,
          type,
          props: {
            text: text.trimEnd(),
          },
        },
      ]);
    }
  };
}

function getGrowY(editor: Editor, shape: TLNoteShape, previousGrowY = 0) {
  const PADDING = 17;

  const nextTextSize = editor.textMeasure.measureText(shape.props.text, {
    ...TEXT_PROPS,
    fontFamily: FONT_FAMILIES[shape.props.font],
    fontSize: LABEL_FONT_SIZES[shape.props.size],
    maxWidth: NOTE_SIZE - PADDING * 2,
  });

  const nextHeight = nextTextSize.h + PADDING * 2;

  let growY: number | null = null;

  if (nextHeight > NOTE_SIZE) {
    growY = nextHeight - NOTE_SIZE;
  } else {
    if (previousGrowY) {
      growY = 0;
    }
  }

  if (growY !== null) {
    return {
      ...shape,
      props: {
        ...shape.props,
        growY,
      },
    };
  }
}
