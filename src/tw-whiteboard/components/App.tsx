/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { StrictMode, useCallback, useEffect, useState } from 'react';

import { type IDefaultWidgetProps, ParentWidgetContext } from '$:/plugins/linonetwo/tw-react/index.js';
import { debounce, Editor, parseTldrawJsonFile, serializeTldrawJson, StoreSnapshot, TLAnyShapeUtilConstructor, Tldraw, TLRecord, transact } from '@tldraw/tldraw';

// FIXME: tldraw haven't export these types, but they are useable https://github.com/tldraw/tldraw/issues/1939
// @ts-expect-error Module '"@tldraw/editor"' has no exported member 'partition'.ts(2305)
import { partition, TLStateNodeConstructor } from '@tldraw/editor';

import './App.css';
import '@tldraw/tldraw/tldraw.css';
import { getAssetUrlsByMetaUrl } from '../tldraw/assets/urls';
import { WikiTextShapeTool } from '../tldraw/shapes/wikitext/WikiTextShapeTool';
import { WikiTextShapeUtil } from '../tldraw/shapes/wikitext/WikiTextShapeUtil';

/** every ms to save */
const debounceSaveTime = 500;
export interface IAppProps {
  /**
   * Tiddler to contain the serialized JSON component state
   */
  currentTiddler: string;
  height?: string;
  initialTiddlerText?: string;
  isDraft: boolean;
  readonly?: boolean;
  saver: {
    /** ms about debounce how long between save */
    interval?: number;
    /** a lock to prevent update from tiddler to slate, when update of tiddler is trigger by slate. */
    lock: () => void;
    onSave: (value: string) => void;
  };
  width?: string;
  zoom?: string;
  zoomToFit?: boolean;
}

export interface TDExportJSON {
  document?: StoreSnapshot<TLRecord>;
  updatedCount?: number;
}

const extraShapeUtils: TLAnyShapeUtilConstructor[] = [WikiTextShapeUtil];
const extraTools: TLStateNodeConstructor[] = [WikiTextShapeTool];

const assetUrls = getAssetUrlsByMetaUrl((assetUrl: string) => {
  const assetData = $tw.wiki.getTiddler(`$:/plugins/linonetwo/tw-whiteboard/assets/${assetUrl}`);
  if (assetData) {
    // https://github.com/tldraw/tldraw/issues/1941
    // data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' fill='none'%3E%3Cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 5H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6M19 5h6m0 0v6m0-6L13 17'/%3E%3C/svg%3E
    return `data:${assetData.fields.type};utf8,${encodeURIComponent(assetData.fields.text)}`;
  }
  // <div class="tlui-icon tlui-icon__small" style="mask: url(&quot;https://unpkg.com/@tldraw/assets@2.0.0-alpha.12/icons/icon/duplicate.svg&quot;) center 100% / 100% no-repeat;"></div>
  return `https://unpkg.com/@tldraw/assets@2.0.0-alpha.12/${assetUrl}`;
});

export function App(props: IAppProps & IDefaultWidgetProps): JSX.Element {
  const {
    height,
    width,
    currentTiddler,
    initialTiddlerText,
    isDraft,
    readonly,
    zoomToFit,
    zoom,
    saver: { onSave, lock },
    parentWidget,
  } = props;

  const [editor, setEditor] = useState<Editor | undefined>(undefined);

  const onMount = useCallback((newEditor: Editor) => {
    setEditor(newEditor);
    if (initialTiddlerText) {
      const parseFileResult = parseTldrawJsonFile({
        schema: newEditor.store.schema,
        json: initialTiddlerText,
      });
      if (!parseFileResult.ok) {
        console.error(`$:/plugins/linonetwo/tw-whiteboard load tiddler ${currentTiddler} failed, text:\n${initialTiddlerText}\n${parseFileResult.error.type}`);
      }
      // tldraw file contain the full state of the app,
      // including ephemeral data. it up to the opener to
      // decide what to restore and what to retain. Here, we
      // just restore everything, so if the user has opened
      // this file before they'll get their camera etc.
      // restored. we could change this in the future.
      transact(() => {
        newEditor.store.clear();
        // FIXME: tldraw haven't export these types, but they are useable https://github.com/tldraw/tldraw/issues/1939
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-argument */
        /* eslint-disable @typescript-eslint/no-unsafe-call */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const [shapes, nonShapes] = partition(
          // @ts-expect-error Property 'value' does not exist on type 'Result<TLStore, TldrawFileParseError>'.
          parseFileResult.value.allRecords(),
          // @ts-expect-error Parameter 'record' implicitly has an 'any' type.ts(7006)
          (record) => record.typeName === 'shape',
        );
        newEditor.store.put(nonShapes, 'initialize');
        // @ts-expect-error Property 'ensureStoreIsUsable' does not exist on type 'TLStore'.ts(2339)
        newEditor.store.ensureStoreIsUsable();
        newEditor.store.put(shapes, 'initialize');
        newEditor.history.clear();
        newEditor.updateViewportScreenBounds();
        // @ts-expect-error Property 'updateRenderingBounds' does not exist on type 'Editor'. Did you mean 'renderingBounds'?ts(2551)
        newEditor.updateRenderingBounds();
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        /* eslint-enable @typescript-eslint/no-unsafe-argument */
        /* eslint-enable @typescript-eslint/no-unsafe-call */
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        const bounds = newEditor.currentPageBounds;
        if (bounds) {
          newEditor.zoomToBounds(bounds, 1);
        }
      });
    }
    if ($tw.wiki.getTiddlerText('$:/info/darkmode') === 'yes') newEditor.user.updateUserPreferences({ isDarkMode: true });
    newEditor.updateInstanceState({ isReadonly: Boolean(readonly), isDebugMode: false });
    if (zoomToFit === true) {
      newEditor.zoomToFit();
    } else if (Number.isFinite(Number(zoom))) {
      const bounds = newEditor.selectionPageBounds ?? newEditor.currentPageBounds;
      if (bounds) {
        newEditor.zoomToBounds(bounds, Math.min(1, Number(zoom)), { duration: 220 });
      }
    }
  }, [initialTiddlerText, readonly, zoomToFit, zoom, currentTiddler]);

  // emergency save on close or switch to other editor (by changing the type field) or readonly
  // this only work as willUnMount
  useEffect(() => {
    return () => {
      if (readonly) return;
      void (async () => {
        if (!editor) return;
        onSave(await serializeTldrawJson(editor.store));
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const deferSave = useCallback(
    () => {
      const saveCallback = async () => {
        if (editor === undefined) return;
        const newTiddlerText = await serializeTldrawJson(editor.store);
        lock();
        onSave(newTiddlerText);
      };
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(saveCallback, { timeout: 60 });
      } else if (typeof requestAnimationFrame === 'undefined') {
        setTimeout(saveCallback, 16.66);
      } else {
        requestAnimationFrame(saveCallback);
      }
    },
    [editor, lock, onSave],
  );

  /**
   * @url https://github.com/tldraw/tldraw/blob/main/apps/vscode/editor/src/ChangeResponder.tsx
   */
  useEffect(() => {
    if (!editor) return;
    const handleChange = debounce(deferSave, debounceSaveTime);
    editor.on('change-history', handleChange);
    return () => {
      if (!editor) return;
      editor.off('change-history', handleChange);
    };
  }, [deferSave, editor]);

  return (
    <StrictMode>
      <ParentWidgetContext.Provider value={parentWidget}>
        <div className='tw-whiteboard-tldraw-container' style={{ height, width }}>
          <Tldraw persistenceKey={currentTiddler} onMount={onMount} shapeUtils={extraShapeUtils} tools={extraTools} autoFocus={false} assetUrls={assetUrls} />
        </div>
      </ParentWidgetContext.Provider>
    </StrictMode>
  );
}
