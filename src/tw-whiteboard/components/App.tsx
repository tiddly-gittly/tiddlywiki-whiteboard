/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';

import './App.css';
import { type IDefaultWidgetProps, ParentWidgetContext } from '$:/plugins/linonetwo/tw-react/index.js';
import { debounce, Editor, parseTldrawJsonFile, serializeTldrawJson, StoreSnapshot, TLAnyShapeUtilConstructor, Tldraw, TLRecord } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import '@tldraw/editor/editor.css';

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

const extraShapeUtils: TLAnyShapeUtilConstructor[] = [];

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
    }
    newEditor.updateInstanceState({ isReadonly: Boolean(readonly) });
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
          <Tldraw persistenceKey={currentTiddler} onMount={onMount} shapeUtils={extraShapeUtils} autoFocus={false} />
        </div>
      </ParentWidgetContext.Provider>
    </StrictMode>
  );
}
