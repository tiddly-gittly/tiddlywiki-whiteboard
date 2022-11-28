/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useState, useMemo, useEffect, useCallback } from 'react';
import useDebouncedCallback from 'beautiful-react-hooks/useDebouncedCallback';

import './tldraw.css';

/** every ms to save */
const debounceSaveTime = 500;
export interface IAppProps {
  /**
   * Tiddler to contain the serialized JSON component state
   */
  currentTiddler: string;
  height?: string;
  initialTiddlerText?: string;
  saver: {
    /** ms about debounce how long between save */
    interval?: number;
    onSave: (value: string) => void;
  };
  width?: string;
}

export interface TDExportJSON {
  assets: TDAsset[];
  document: TDDocument;
}

export function App(props: IAppProps): JSX.Element {
  const {
    height,
    width,
    currentTiddler,
    initialTiddlerText,
    saver: { onSave },
  } = props;
  const getTiddlerJSONContent = useCallback(() => {
    if (initialTiddlerText) {
      try {
        const data = JSON.parse(initialTiddlerText) as TDExportJSON;
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
  const [tldrawDocument, tldrawDocumentSetter] = useState<TDDocument | undefined>(initialTiddlerJSONContent);
  const debouncedSaveOnChange = useDebouncedCallback(
    (app: TldrawApp) => {
      const exportedTldrJSON = { document: app.document, assets: app.assets };
      const newTiddlerText = JSON.stringify(exportedTldrJSON);
      onSave(newTiddlerText);
    },
    [],
    debounceSaveTime,
  );
  const onChange = (app: TldrawApp) => {
    // set document title
    app.document.name = currentTiddler;
    tldrawDocumentSetter(app.document);
    debouncedSaveOnChange(app);
  };
  return (
    <div className="tw-whiteboard-tldraw-container" style={{ height, width }}>
      <Tldraw onPersist={onChange} document={tldrawDocument} autofocus={false} />
    </div>
  );
}
