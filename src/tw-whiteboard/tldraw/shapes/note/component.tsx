/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';
import { getDefaultColorTheme, TLNoteShape, useEditor, useIsEditing } from '@tldraw/editor';
import { ChangeEvent, CSSProperties, useCallback, useMemo, useRef } from 'react';
import { IParseTreeNode } from 'tiddlywiki';

import './style.css';
import { lingo } from 'src/tw-whiteboard/utils/lingo';
import { getCurrentPaletteColors } from 'src/tw-whiteboard/utils/palette';
import { wrapTiddlerAst } from 'src/tw-whiteboard/utils/wrapTiddlerAst';

function getWikiTextFromRichText(richText: TLNoteShape['props']['richText']) {
  return richText.content
    .map((node: any) => {
      if (node.type !== 'paragraph') {
        return '';
      }

      return (node.content ?? [])
        .map((childNode: any) => {
          if (childNode.type !== 'text') {
            return '';
          }

          return childNode.text;
        })
        .join('');
    })
    .join('\n');
}

function getRichTextFromWikiText(wikiText: string): TLNoteShape['props']['richText'] {
  return {
    type: 'doc',
    content: wikiText.split(/\r?\n/u).map((line) => {
      if (!line) {
        return { type: 'paragraph' };
      }

      return {
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      };
    }),
  };
}

export function NoteComponent({ shape, isDarkMode }: { isDarkMode: boolean; shape: TLNoteShape }) {
  const editor = useEditor();
  const theme = getDefaultColorTheme({ isDarkMode });
  const paletteColors = getCurrentPaletteColors();
  const isEditing = useIsEditing(shape.id);
  const tiddlerText = getWikiTextFromRichText(shape.props.richText);
  const adjustedColor = shape.props.color === 'black' ? 'yellow' : shape.props.color;

  const astNode = useMemo<IParseTreeNode>(() => {
    if (!tiddlerText) return wrapTiddlerAst({ type: 'text', text: `${lingo('Tools/Note/DbClickEdit')}` });
    return wrapTiddlerAst($tw.wiki.parseText('text/vnd.tiddlywiki', tiddlerText).tree);
  }, [tiddlerText]);
  const noteRenderContainerReference = useRef<HTMLDivElement>(null);
  useWidget(astNode, noteRenderContainerReference, { skip: isEditing });

  const editTitleInputReference = useRef<HTMLTextAreaElement>(null);
  const onTextInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    editor?.store.update(shape.id, (record: any) => ({
      ...record,
      props: {
        ...record.props,
        richText: getRichTextFromWikiText(event.target.value),
      },
    }));
  }, [editor, shape.id]);
  const editTitleContainerOnClick = useCallback(() => {
    editTitleInputReference.current?.focus?.();
  }, []);

  const sharedStyle: CSSProperties = {
    backgroundColor: theme[adjustedColor].solid,
    color: theme.black.solid,
  };
  (sharedStyle as any)['--tw-whiteboard-chrome-border'] = paletteColors.dropdownBorder;
  (sharedStyle as any)['--tw-whiteboard-chrome-shadow'] = paletteColors.shadow;
  (sharedStyle as any)['--tw-whiteboard-chrome-shadow-subtle'] = paletteColors.shadowSubtle;

  return (
    <div className='note-shape-component-outer'>
      <div
        className='note-shape-component-inner note-shape-edit-mode'
        key='edit-title'
        style={{ display: isEditing ? undefined : 'none', ...sharedStyle }}
        onClick={editTitleContainerOnClick}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        <textarea
          tabIndex={1}
          autoFocus
          placeholder={lingo('Tools/Note/PlaceHolder')}
          defaultValue={tiddlerText}
          ref={editTitleInputReference}
          onChange={onTextInputChange}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
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
