import { createShapePropsMigrationIds, createShapePropsMigrationSequence, noteShapeProps as rawNoteShapeProps, T } from '@tldraw/editor';

export const noteShapeProps = {
  ...rawNoteShapeProps,
  w: T.number,
  h: T.number,
};

const Versions = createShapePropsMigrationIds('wikitext-note', {
  AddUrlProp: 1,
  RemoveJustify: 2,
  MigrateLegacyAlign: 3,
  AddVerticalAlign: 4,
  MakeUrlsValid: 5,
  AddFontSizeAdjustment: 6,
  AddScale: 7,
  AddLabelColor: 8,
});

export { Versions as noteShapeVersions };

/** @public */
export const noteShapeMigrations = createShapePropsMigrationSequence({
  sequence: [
    {
      id: Versions.AddUrlProp,
      up: (props) => {
        props.url = '';
      },
      down: 'retired',
    },
    {
      id: Versions.RemoveJustify,
      up: (props) => {
        if (props.align === 'justify') {
          props.align = 'start';
        }
      },
      down: 'retired',
    },
    {
      id: Versions.MigrateLegacyAlign,
      up: (props) => {
        switch (props.align) {
          case 'start': {
            props.align = 'start-legacy';
            return;
          }
          case 'end': {
            props.align = 'end-legacy';
            return;
          }
          default: {
            props.align = 'middle-legacy';
          }
        }
      },
      down: 'retired',
    },
    {
      id: Versions.AddVerticalAlign,
      up: (props) => {
        props.verticalAlign = 'middle';
      },
      down: 'retired',
    },
    {
      id: Versions.MakeUrlsValid,
      up: (props) => {
        if (!T.linkUrl.isValid(props.url)) {
          props.url = '';
        }
      },
      down: (_props) => {
        // noop
      },
    },
    {
      id: Versions.AddFontSizeAdjustment,
      up: (props) => {
        props.fontSizeAdjustment = 0;
      },
      down: (props) => {
        delete props.fontSizeAdjustment;
      },
    },
    {
      id: Versions.AddScale,
      up: (props) => {
        props.scale = 1;
      },
      down: (props) => {
        delete props.scale;
      },
    },
    {
      id: Versions.AddLabelColor,
      up: (props) => {
        props.labelColor = 'black';
      },
      down: (props) => {
        delete props.labelColor;
      },
    },
  ],
});
