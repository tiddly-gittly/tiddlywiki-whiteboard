/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';
import { getDefaultColorTheme, useEditor, useIsEditing } from '@tldraw/editor';
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';
import { ChangeEvent, CSSProperties, useCallback, useMemo, useRef } from 'react';
import { IParseTreeNode } from 'tiddlywiki';

import { TranscludeShape } from './type';
import './style.css';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { wrapTiddlerAst } from 'src/tw-whiteboard/utils/wrapTiddlerAst';

export function TranscludeComponent({ shape, isDarkMode }: { isDarkMode: boolean; shape: TranscludeShape }) {
  const editor = useEditor();
  const theme = getDefaultColorTheme({ isDarkMode });
  const isEditing = useIsEditing(shape.id);
  const tiddlerTitle = shape.props.title;
  const tiddlerField = shape.props.field ?? 'text';
  const adjustedColor = shape.props.color === 'black' ? 'grey' : shape.props.color;

  const astNode = useMemo<IParseTreeNode>(() => {
    if (!tiddlerTitle) return wrapTiddlerAst({ type: 'text', text: `${lingo('Tools/Transclusion/NoTiddlerTitle')}` });
    const fields = $tw.wiki.getTiddler(tiddlerTitle)?.fields;
    if (fields === undefined) return wrapTiddlerAst({ type: 'text', text: `${tiddlerTitle} ${lingo('Tools/Transclusion/TiddlerMissing')}` });
    const text = fields?.[tiddlerField];
    if (!text) return wrapTiddlerAst({ type: 'text', text: `${tiddlerTitle} ${lingo('Tools/Transclusion/NoTextOnField')} ${tiddlerField}` });
    const childTree = $tw.wiki.parseText(fields.type || 'text/vnd.tiddlywiki', String(text)).tree;
    return { type: 'tiddler', children: childTree };
  }, [tiddlerField, tiddlerTitle]);
  const transcludeRenderContainerReference = useRef<HTMLDivElement>(null);
  useWidget(astNode, transcludeRenderContainerReference, { skip: isEditing });

  const editTitleInputContainerReference = useRef<HTMLInputElement>(null);
  const onTitleInputChange = useDebouncedCallback((event: ChangeEvent<HTMLInputElement>) => {
    editor?.store.update(shape.id, (record) => ({
      ...record,
      props: {
        ...record.props,
        title: event.target.value,
      },
    }));
  }, []);
  const editTitleContainerOnClick = useCallback(() => {
    editTitleInputContainerReference.current?.focus?.();
  }, []);

  const sharedStyle: CSSProperties = {
    backgroundColor: theme[adjustedColor].solid,
    color: theme.black.solid,
  };

  return (
    <div className='transclusion-shape-component-outer'>
      <div
        className='transclusion-shape-component-inner transclusion-shape-edit-mode'
        key='edit-title'
        style={{ display: isEditing ? undefined : 'none', ...sharedStyle }}
        onClick={editTitleContainerOnClick}
      >
        <input
          tabIndex={1}
          autoFocus
          type='text'
          placeholder={lingo('Tools/Transclusion/PlaceHolder')}
          defaultValue={tiddlerTitle}
          ref={editTitleInputContainerReference}
          onChange={onTitleInputChange}
        />
      </div>
      <div className='transclusion-shape-component-inner' key='render' style={{ display: isEditing ? 'none' : undefined, ...sharedStyle }}>
        <h2>{tiddlerTitle}</h2>
        <div ref={transcludeRenderContainerReference}>Transclusion loading...</div>
      </div>
    </div>
  );
}
