/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';
import { getDefaultColorTheme, useEditor, useIsEditing } from '@tldraw/editor';
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';
import { ChangeEvent, CSSProperties, useCallback, useMemo, useRef } from 'react';
import { IParseTreeNode } from 'tiddlywiki';

import { NoteShape } from './type';
import './style.css';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { wrapTiddlerAst } from 'src/tw-whiteboard/utils/wrapTiddlerAst';

export function NoteComponent({ shape, isDarkMode }: { isDarkMode: boolean; shape: NoteShape }) {
  const editor = useEditor();
  const theme = getDefaultColorTheme({ isDarkMode });
  const isEditing = useIsEditing(shape.id);
  const tiddlerText = shape.props.text ?? '';
  const adjustedColor = shape.props.color === 'black' ? 'yellow' : shape.props.color;

  const astNode = useMemo<IParseTreeNode>(() => {
    if (!tiddlerText) return wrapTiddlerAst({ type: 'text', text: `${lingo('Tools/Note/DbClickEdit')}` });
    return wrapTiddlerAst($tw.wiki.parseText('text/vnd.tiddlywiki', tiddlerText).tree);
  }, [tiddlerText]);
  const noteRenderContainerReference = useRef<HTMLDivElement>(null);
  useWidget(astNode, noteRenderContainerReference, { skip: isEditing });

  const editTitleInputReference = useRef<HTMLTextAreaElement>(null);
  const onTextInputChange = useDebouncedCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    editor?.store.update(shape.id, (record) => ({
      ...record,
      props: {
        ...record.props,
        text: event.target.value,
      },
    }));
  }, []);
  const editTitleContainerOnClick = useCallback(() => {
    editTitleInputReference.current?.focus?.();
  }, []);

  const sharedStyle: CSSProperties = {
    backgroundColor: theme[adjustedColor].solid,
    color: theme.black.solid,
  };

  return (
    <div className='note-shape-component-outer'>
      <div
        className='note-shape-component-inner note-shape-edit-mode'
        key='edit-title'
        style={{ display: isEditing ? undefined : 'none', ...sharedStyle }}
        onClick={editTitleContainerOnClick}
      >
        <textarea
          tabIndex={1}
          autoFocus
          placeholder={lingo('Tools/Note/PlaceHolder')}
          defaultValue={tiddlerText}
          ref={editTitleInputReference}
          onChange={onTextInputChange}
        />
      </div>
      <div className='note-shape-component-inner note-shape-view-mode' key='render' style={{ display: isEditing ? 'none' : undefined, ...sharedStyle }}>
        <div
          ref={noteRenderContainerReference}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          Note loading...
        </div>
      </div>
    </div>
  );
}
