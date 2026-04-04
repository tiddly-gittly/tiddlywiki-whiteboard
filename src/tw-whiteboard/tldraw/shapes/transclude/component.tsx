/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';
import { getDefaultColorTheme, useEditor, useIsEditing } from '@tldraw/editor';
import { CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';
import { IParseTreeNode } from 'tiddlywiki';

import { TranscludeShape } from './type';
import './style.css';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { getCurrentPaletteColors } from 'src/tw-whiteboard/utils/palette';
import { wrapTiddlerAst } from 'src/tw-whiteboard/utils/wrapTiddlerAst';
import { ShapeViewToolbar } from './ShapeViewToolbar';
import { TiddlerTitleInput } from './TiddlerTitleInput';
import { useOnToggleFold } from './useOnToggleFold';

export function TranscludeComponent({ shape, isDarkMode }: { isDarkMode: boolean; shape: TranscludeShape }) {
  const editor = useEditor();
  const theme = getDefaultColorTheme({ isDarkMode });
  const paletteColors = getCurrentPaletteColors();
  const isEditing = useIsEditing(shape.id);
  const tiddlerTitle = shape.props.title?.replaceAll('\n', '');
  const tiddlerField = shape.props.field ?? 'text';
  const adjustedColor = shape.props.color === 'black' ? 'grey' : shape.props.color;

  const astNode = useMemo<IParseTreeNode>(() => {
    if (!tiddlerTitle) return wrapTiddlerAst({ type: 'text', text: `${lingo('Tools/Transclude/NoTiddlerTitle')} ${lingo('Tools/Note/DbClickEdit')}` });
    const fields = $tw.wiki.getTiddler(tiddlerTitle)?.fields;
    if (fields === undefined) return wrapTiddlerAst({ type: 'text', text: `${tiddlerTitle} ${lingo('Tools/Transclude/TiddlerMissing')} ${lingo('Tools/Note/DbClickEdit')}` });
    const text = fields?.[tiddlerField];
    if (!text) return wrapTiddlerAst({ type: 'text', text: `${tiddlerTitle} ${lingo('Tools/Transclude/NoTextOnField')} ${tiddlerField} ${lingo('Tools/Note/DbClickEdit')}` });
    const childTree = $tw.wiki.parseText(fields.type || 'text/vnd.tiddlywiki', String(text)).tree;
    return { type: 'tiddler', children: childTree };
  }, [tiddlerField, tiddlerTitle]);
  const transcludeRenderContainerReference = useRef<HTMLDivElement>(null);
  useWidget(astNode, transcludeRenderContainerReference, { skip: isEditing || shape.props.folded });

  const editTitleInputReference = useRef<HTMLInputElement>(null);
  const onTitleInputChange = useCallback((newValue: string) => {
    editor?.store.update(shape.id, (record) => ({
      ...record,
      props: {
        ...record.props,
        title: newValue,
      },
    }));
  }, [editor, shape.id]);
  const editTitleContainerOnClick = useCallback(() => {
    editTitleInputReference.current?.focus?.();
  }, []);
  const onToggleFold = useOnToggleFold(shape);
  useEffect(() => {
    if (isEditing && shape.props.folded) {
      onToggleFold();
    }
  }, [isEditing, onToggleFold, shape.props.folded]);

  const sharedStyle: CSSProperties = {
    backgroundColor: theme[adjustedColor].solid,
    color: theme.black.solid,
    '--tw-whiteboard-chrome-border': paletteColors.dropdownBorder,
    '--tw-whiteboard-chrome-divider': paletteColors.divider,
    '--tw-whiteboard-chrome-shadow': paletteColors.shadow,
    '--tw-whiteboard-chrome-shadow-subtle': paletteColors.shadowSubtle,
    '--tw-whiteboard-editor-background': paletteColors.dropdownBackground,
    '--tw-whiteboard-editor-foreground': paletteColors.foreground,
    '--tw-whiteboard-editor-selected-background': paletteColors.selectionBackground,
    '--tw-whiteboard-editor-selected-foreground': paletteColors.selectionForeground,
  };

  return (
    <div className='transclude-shape-component-outer'>
      <div
        className='transclude-shape-component-inner transclude-shape-edit-mode'
        key='edit-title'
        style={{ display: isEditing ? undefined : 'none', ...sharedStyle }}
        onClick={editTitleContainerOnClick}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <TiddlerTitleInput editTitleInputReference={editTitleInputReference} onTitleInputChange={onTitleInputChange} tiddlerTitle={tiddlerTitle} />
      </div>
      <div className='transclude-shape-component-inner' key='render' style={{ display: isEditing ? 'none' : undefined, ...sharedStyle }}>
        <h2>{tiddlerTitle}</h2>
        <div
          ref={transcludeRenderContainerReference}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          style={{ display: shape.props.folded ? 'none' : undefined }}
        >
          Transclude loading...
        </div>
        <ShapeViewToolbar shape={shape} onToggleFold={onToggleFold} />
      </div>
    </div>
  );
}
