/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';

import './App.css';
import type { TldrawApp } from './Tldraw/state';
import type { TDAsset, TDDocument } from './Tldraw/types';
import { Tldraw } from './Tldraw/Tldraw';
import { IDefaultWidgetProps, ParentWidgetContext } from 'tw-react';

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
}

export interface TDExportJSON {
  assets?: TDAsset[];
  document: TDDocument;
  updatedCount?: number;
}

export function App(props: IAppProps & IDefaultWidgetProps): JSX.Element {
  const {
    height,
    width,
    currentTiddler,
    initialTiddlerText,
    isDraft,
    readonly,
    saver: { onSave, lock },
    parentWidget,
  } = props;
  const updatedCountReference = useRef(0);
  const getTiddlerJSONContent = useCallback(() => {
    if (initialTiddlerText) {
      try {
        const data = JSON.parse(initialTiddlerText) as TDExportJSON;
        updatedCountReference.current = data.updatedCount ?? 0;
        // seems assets is discarded, from official tldr repo's example... examples/tldraw-example/src/loading-files.tsx
        return data.document;
      } catch (error) {
        console.error(`$:/plugins/linonetwo/tw-whiteboard load tiddler ${currentTiddler} failed, text:\n${initialTiddlerText}\n${(error as Error).message}`);
      }
    }
  }, [initialTiddlerText, currentTiddler]);
  // this initialTiddlerJSONContent should only execute on mount once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialTiddlerJSONContent = useMemo(getTiddlerJSONContent, []);
  useEffect(() => {
    const latestUpdatedDocument = getTiddlerJSONContent();
    if (latestUpdatedDocument !== undefined) {
      tldrawDocumentSetter(latestUpdatedDocument);
    }
  }, [getTiddlerJSONContent]);
  const [tldrawDocument, tldrawDocumentSetterRaw] = useState<TDDocument | undefined>(initialTiddlerJSONContent);
  const tldrawDocumentReference = useRef(tldrawDocument);
  const tldrawDocumentSetter = (newDocument: TDDocument) => {
    tldrawDocumentSetterRaw(newDocument);
    tldrawDocumentReference.current = newDocument;
  };
  const deferSave = useCallback(
    (app: TldrawApp) => {
      const saveCallback = () => {
        const exportedTldrJSON: TDExportJSON = { document: app.document, updatedCount: ++updatedCountReference.current };
        const newTiddlerText = JSON.stringify(exportedTldrJSON);
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
    [onSave, lock],
  );
  const debouncedSaveOnChange = useDebouncedCallback(
    (app: TldrawApp) => {
      deferSave(app);
    },
    [deferSave],
    debounceSaveTime,
  );
  const onChange = (app: TldrawApp) => {
    // set document title
    app.document.name = currentTiddler;
    tldrawDocumentSetter(app.document);
    if (!isDraft && !readonly) {
      debouncedSaveOnChange(app);
    }
  };
  useEffect(() => {
    // this only work as willUnMount
    return () => {
      if (readonly) return;
      // emergency save on close or switch to other editor (by changing the type field) or readonly
      const exportedTldrJSON = { document: tldrawDocumentReference.current, updatedCount: ++updatedCountReference.current };
      onSave(JSON.stringify(exportedTldrJSON));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ParentWidgetContext.Provider value={parentWidget}>
      <div className="tw-whiteboard-tldraw-container" style={{ height, width }}>
        <Tldraw onPersist={onChange} document={tldrawDocument} autofocus={false} readOnly={readonly} />
      </div>
    </ParentWidgetContext.Provider>
  );
}
