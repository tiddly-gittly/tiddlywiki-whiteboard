import { useCallback, useEffect, useMemo, useState } from 'react';

import { type IDefaultWidgetProps, ParentWidgetContext } from '$:/plugins/linonetwo/tw-react/index.js';
import { debounce, Editor, parseTldrawJsonFile, serializeTldrawJson, StoreSnapshot, Tldraw, TLRecord } from '@tldraw/tldraw';

// FIXME: tldraw haven't export these types, but they are useable https://github.com/tldraw/tldraw/issues/1939
// @ts-expect-error Module '"@tldraw/editor"' has no exported member 'partition'.ts(2305)
import { partition, TLStateNodeConstructor } from '@tldraw/editor';

import './App.css';
import '@tldraw/tldraw/tldraw.css';
import { assetUrls } from '../tldraw/assets/formatedAssets';
import { getComponents, getOverrides } from '../tldraw/overrides';
import { NoteTool } from '../tldraw/shapes/note/tool';
import { WIkiTextTLNoteShapeUtil as NoteShapeUtility } from '../tldraw/shapes/note/util';
import { TranscludeTool } from '../tldraw/shapes/transclude/tool';
import { TranscludeShapeUtil as TranscludeShapeUtility } from '../tldraw/shapes/transclude/util';
import { PropsContext } from '../utils/context';

/** every ms to save */
const debounceSaveTime = 500;
export interface IAppProps {
  /**
   * Tiddler to contain the serialized JSON component state
   */
  currentTiddler?: string;
  focused: boolean;
  height?: string;
  initialTiddlerText?: string;
  isDarkMode: boolean;
  isDraft: boolean;
  locale: string;
  onReady: () => void;
  readonly?: boolean;
  saver: {
    /** ms about debounce how long between save */
    interval?: number;
    /** a lock to prevent update from tiddler to slate, when update of tiddler is trigger by slate. */
    lock: () => void;
    onSave: (title: string, value: string) => void;
  };
  width?: string;
  zoom?: string;
  zoomToFit?: boolean;
}

export interface TDExportJSON {
  document?: StoreSnapshot<TLRecord>;
  updatedCount?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const extraTools: TLStateNodeConstructor[] = [NoteTool, TranscludeTool] as any;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
const extraShapeUtilities = [NoteShapeUtility, TranscludeShapeUtility] as any;

export function App(props: IAppProps & IDefaultWidgetProps): React.JSX.Element {
  const {
    height,
    width,
    currentTiddler,
    initialTiddlerText,
    readonly,
    zoomToFit,
    zoom,
    saver: { onSave, lock },
    parentWidget,
    isDarkMode,
    locale,
    isDraft,
    focused,
    onReady,
  } = props;

  const [editor, setEditor] = useState<Editor | undefined>(undefined);

  useEffect(() => {
    if (!editor) return;
    // set configs
    editor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light', locale });
  }, [editor, isDarkMode, locale]);
  useEffect(() => {
    if (!editor) return;
    editor.updateInstanceState({ isFocused: focused });
  }, [editor, focused]);

  const onMount = useCallback((newEditor: Editor) => {
    setEditor(newEditor);
    onReady();
    if (initialTiddlerText) {
      // Backward-compat: migrate legacy shape type 'wikitext-note' -> 'note' before parsing
      // Also strip the old subType from schema.recordVersions so tldraw's validator doesn't reject it
      const migratedText = initialTiddlerText
        // Remove "wikitext-note":N from schema subTypeVersions (old format)
        .replace(/,\s*"wikitext-note"\s*:\s*\d+/g, '')
        .replace(/"wikitext-note"\s*:\s*\d+\s*,/g, '')
        // Remove "com.tldraw.shape.wikitext-note":N from new schema format
        .replace(/,\s*"com\.tldraw\.shape\.wikitext-note"\s*:\s*\d+/g, '')
        .replace(/"com\.tldraw\.shape\.wikitext-note"\s*:\s*\d+\s*,/g, '')
        // Replace all remaining occurrences to just "note"
        .replace(/"wikitext-note"/g, '"note"');
      const parseFileResult = parseTldrawJsonFile({
        schema: newEditor.store.schema,
        json: migratedText,
      });
      if (!parseFileResult.ok) {
        const errorMessage = `$:/plugins/linonetwo/tw-whiteboard load tiddler ${currentTiddler} failed, type: ${parseFileResult.error.type}, cause ${
          JSON.stringify(parseFileResult.error)
        },\ntext:\n${initialTiddlerText}`;
        $tw.utils.error(errorMessage);
        return;
      }
      // https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/lib/utils/tldr/file.ts
      // tldraw file contain the full state of the app,
      // including ephemeral data. it up to the opener to
      // decide what to restore and what to retain. Here, we
      // just restore everything, so if the user has opened
      // this file before they'll get their camera etc.
      // restored. we could change this in the future.
      // FIXME: tldraw haven't export these types, but they are useable https://github.com/tldraw/tldraw/issues/1939
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */

      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      // @ts-expect-error Property 'atomic' does not exist on type 'TLStore'.ts(2339)
      newEditor.store.atomic(() => {
        const initialBounds = newEditor.getViewportScreenBounds().clone();
        const isFocused = newEditor.getInstanceState().isFocused;
        newEditor.store.clear();
        const [shapes, nonShapes] = partition(
          parseFileResult.value.allRecords(),
          (record: { typeName: string }) => record.typeName === 'shape',
        );
        newEditor.store.put(nonShapes, 'initialize');
        // @ts-expect-error Property 'ensureStoreIsUsable' does not exist on type 'TLStore'.ts(2339)
        newEditor.store.ensureStoreIsUsable();
        newEditor.store.put(shapes, 'initialize');
        newEditor.clearHistory();
        // Put the old bounds back in place
        newEditor.updateViewportScreenBounds(initialBounds);

        const bounds = newEditor.getCurrentPageBounds();
        if (bounds) {
          newEditor.zoomToBounds(bounds, { targetZoom: 1 });
        }
        newEditor.updateInstanceState({ isFocused });
        /* eslint-enable @typescript-eslint/no-unsafe-call */
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */

        /* eslint-enable @typescript-eslint/no-unsafe-argument */
      });
    }
    if ($tw.wiki.getTiddlerText('$:/info/darkmode') === 'yes') newEditor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light' });
    newEditor.updateInstanceState({ isReadonly: Boolean(readonly), isDebugMode: false });
    if (zoomToFit === true) {
      newEditor.zoomToFit();
    } else if (Number.isFinite(Number(zoom))) {
      const bounds = newEditor.getSelectionPageBounds() ?? newEditor.getCurrentPageBounds();
      if (bounds) {
        newEditor.zoomToBounds(bounds, { targetZoom: Math.min(1, Number(zoom)) });
      }
    }
  }, [onReady, initialTiddlerText, readonly, zoomToFit, zoom, currentTiddler]);

  // emergency save on close or switch to other editor (by changing the type field) or readonly
  // this only work as willUnMount
  // useless since we have edit template
  useEffect(() => {
    return () => {
      if (readonly ?? isDraft) return;
      void (async () => {
        if (!editor) return;
        onSave(currentTiddler!, await serializeTldrawJson(editor));
      })();
    };
  }, [currentTiddler, editor]);

  const deferSave = useCallback(
    () => {
      const saveCallback = async () => {
        if (editor === undefined) return;
        lock();
        const newTiddlerText = await serializeTldrawJson(editor);
        onSave(currentTiddler!, newTiddlerText);
      };
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(saveCallback, { timeout: 60 });
      } else if (typeof requestAnimationFrame === 'undefined') {
        setTimeout(saveCallback, 16.66);
      } else {
        requestAnimationFrame(saveCallback);
      }
    },
    [currentTiddler, editor, lock, onSave],
  );

  /**
   * @url https://github.com/tldraw/tldraw/blob/main/apps/vscode/editor/src/ChangeResponder.tsx
   */
  useEffect(() => {
    if (!editor) return;
    const handleChange = debounce(deferSave, debounceSaveTime);
    const dispose = editor.store.listen(handleChange, { scope: 'document' });
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!editor) return;
      deferSave();
      dispose();
    };
  }, [deferSave, editor]);

  return (
    <PropsContext.Provider value={props}>
      <ParentWidgetContext.Provider value={parentWidget}>
        <div className='tw-whiteboard-tldraw-container' style={{ height, width }}>
          <Tldraw
            onMount={onMount}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            shapeUtils={extraShapeUtilities}
            tools={extraTools}
            autoFocus={false}
            inferDarkMode
            assetUrls={assetUrls}
            overrides={useMemo(() => getOverrides(props), [currentTiddler])}
            components={useMemo(() => getComponents(props), [currentTiddler])}
          />
        </div>
      </ParentWidgetContext.Provider>
    </PropsContext.Provider>
  );
}
