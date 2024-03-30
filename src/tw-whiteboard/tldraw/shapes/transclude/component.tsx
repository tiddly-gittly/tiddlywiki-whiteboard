/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ParentWidgetContext, useWidget } from '$:/plugins/linonetwo/tw-react/index.js';
import { getDefaultColorTheme, useEditor, useIsEditing } from '@tldraw/editor';
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';
import { ChangeEvent, CSSProperties, useCallback, useContext, useMemo, useRef } from 'react';
import { IParseTreeNode } from 'tiddlywiki';

import { TranscludeShape } from './type';
import './style.css';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { renderSVGTiddler } from 'src/tw-whiteboard/utils/renderSVGTiddler';
import { wrapTiddlerAst } from 'src/tw-whiteboard/utils/wrapTiddlerAst';
import { useOnToggleFold } from './useOnToggleFold';

export function TranscludeComponent({ shape, isDarkMode }: { isDarkMode: boolean; shape: TranscludeShape }) {
  const editor = useEditor();
  const theme = getDefaultColorTheme({ isDarkMode });
  const isEditing = useIsEditing(shape.id);
  const tiddlerTitle = shape.props.title;
  const tiddlerField = shape.props.field ?? 'text';
  const adjustedColor = shape.props.color === 'black' ? 'grey' : shape.props.color;

  const astNode = useMemo<IParseTreeNode>(() => {
    if (!tiddlerTitle) return wrapTiddlerAst({ type: 'text', text: `${lingo('Tools/Transclude/NoTiddlerTitle')}` });
    const fields = $tw.wiki.getTiddler(tiddlerTitle)?.fields;
    if (fields === undefined) return wrapTiddlerAst({ type: 'text', text: `${tiddlerTitle} ${lingo('Tools/Transclude/TiddlerMissing')}` });
    const text = fields?.[tiddlerField];
    if (!text) return wrapTiddlerAst({ type: 'text', text: `${tiddlerTitle} ${lingo('Tools/Transclude/NoTextOnField')} ${tiddlerField}` });
    const childTree = $tw.wiki.parseText(fields.type || 'text/vnd.tiddlywiki', String(text)).tree;
    return { type: 'tiddler', children: childTree };
  }, [tiddlerField, tiddlerTitle]);
  const transcludeRenderContainerReference = useRef<HTMLDivElement>(null);
  useWidget(astNode, transcludeRenderContainerReference, { skip: isEditing || shape.props.folded });

  const editTitleInputReference = useRef<HTMLInputElement>(null);
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
    editTitleInputReference.current?.focus?.();
  }, []);

  const sharedStyle: CSSProperties = {
    backgroundColor: theme[adjustedColor].solid,
    color: theme.black.solid,
  };

  return (
    <div className='transclude-shape-component-outer'>
      <div
        className='transclude-shape-component-inner transclude-shape-edit-mode'
        key='edit-title'
        style={{ display: isEditing ? undefined : 'none', ...sharedStyle }}
        onClick={editTitleContainerOnClick}
      >
        <input
          tabIndex={1}
          autoFocus
          type='text'
          placeholder={lingo('Tools/Transclude/PlaceHolder')}
          defaultValue={tiddlerTitle}
          ref={editTitleInputReference}
          onChange={onTitleInputChange}
        />
      </div>
      <div className='transclude-shape-component-inner' key='render' style={{ display: isEditing ? 'none' : undefined, ...sharedStyle }}>
        <h2>{tiddlerTitle}</h2>
        <div ref={transcludeRenderContainerReference} style={{ display: shape.props.folded ? 'none' : undefined }}>Transclude loading...</div>
        <ShapeViewToolbar shape={shape} />
      </div>
    </div>
  );
}

function ShapeViewToolbar({ shape }: { shape: TranscludeShape }) {
  const foldIcon = useMemo(() => renderSVGTiddler('$:/core/images/fold-button'), []);
  const foldText = useMemo(() => $tw.wiki.getTiddlerText('$:/language/Buttons/Fold/Caption'), []);
  const unfoldIcon = useMemo(() => renderSVGTiddler('$:/core/images/unfold-button'), []);
  const unfoldText = useMemo(() => $tw.wiki.getTiddlerText('$:/language/Buttons/Unfold/Caption'), []);
  const onToggleFold = useOnToggleFold(shape);
  // TODO: change to default layout icon
  const openInStoryIcon = useMemo(() => renderSVGTiddler('$:/core/images/open-window'), []);
  const openInStoryText = useMemo(() => lingo('OpenInDefault'), []);
  const parentWidget = useContext(ParentWidgetContext);
  const onOpenInStory = useCallback(() => {
    $tw.wiki.setText('$:/layout', 'text', undefined, '');
    parentWidget?.dispatchEvent({
      type: 'tm-navigate',
      navigateTo: shape.props.title,
    });
  }, [parentWidget, shape.props.title]);

  if (!shape.props.title) {
    return null;
  }

  return (
    <div className='shape-view-toolbar-container'>
      <button dangerouslySetInnerHTML={{ __html: shape.props.folded ? unfoldIcon : foldIcon }} onClick={onToggleFold} title={shape.props.folded ? unfoldText : foldText} />
      <button dangerouslySetInnerHTML={{ __html: openInStoryIcon }} onClick={onOpenInStory} title={openInStoryText} />
    </div>
  );
}
