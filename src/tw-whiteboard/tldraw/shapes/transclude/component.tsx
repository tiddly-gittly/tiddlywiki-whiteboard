/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';
import { getDefaultColorTheme, useEditor, useIsEditing } from '@tldraw/editor';
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';
import { ChangeEvent, CSSProperties, useCallback, useMemo, useRef } from 'react';
import { IParseTreeNode } from 'tiddlywiki';

import { TranscludeShape } from './type';
import './style.css';

export function TranscludeComponent({ shape, isDarkMode }: { isDarkMode: boolean; shape: TranscludeShape }) {
  const editor = useEditor();
  const theme = getDefaultColorTheme({ isDarkMode });
  const isEditing = useIsEditing(shape.id);
  const tiddlerTitle = shape.props.title;
  const tiddlerField = shape.props.field ?? 'text';
  const adjustedColor = shape.props.color === 'black' ? 'grey' : shape.props.color;

  const astNode = useMemo<IParseTreeNode>(() => {
    if (tiddlerTitle === undefined) return { type: 'string', text: 'No tiddler title' };
    const fields = $tw.wiki.getTiddler(tiddlerTitle)?.fields;
    if (fields === undefined) return { type: 'string', text: `No tiddler ${tiddlerTitle}` };
    const text = fields?.[tiddlerField];
    if (typeof text !== 'string') return { type: 'string', text: `No text on field ${tiddlerField}` };
    const childTree = $tw.wiki.parseText(fields.type || 'text/vnd.tiddlywiki', text).tree;
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
        <input tabIndex={1} autoFocus type='text' ref={editTitleInputContainerReference} onChange={onTitleInputChange} />
      </div>
      <div className='transclusion-shape-component-inner' key='render' style={{ display: isEditing ? 'none' : undefined, ...sharedStyle }}>
        <h2>{tiddlerTitle}</h2>
        <div ref={transcludeRenderContainerReference}>Transclusion loading...</div>
      </div>
    </div>
  );
}
