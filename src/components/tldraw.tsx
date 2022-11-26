/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useState, useMemo } from 'react';
import { TDDocument, Tldraw, TldrawApp } from '@tldraw/tldraw';
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

export function App(props: IAppProps): JSX.Element {
  const {
    height,
    width,
    currentTiddler,
    initialTiddlerText,
    saver: { onSave },
  } = props;
  const initialTiddlerJSONContent = useMemo(() => {
    if (initialTiddlerText) {
      try {
        return JSON.parse(initialTiddlerText) as TDDocument;
      } catch (error) {
        console.error(`$:/plugins/linonetwo/tw-whiteboard load tiddler ${currentTiddler} failed, text:\n${initialTiddlerText}\n${(error as Error).message}`);
      }
    }
  }, [currentTiddler, initialTiddlerText]);
  const [tldrawDocument, tldrawDocumentSetter] = useState<TDDocument | undefined>(initialTiddlerJSONContent);
  const debouncedSaveOnChange = useDebouncedCallback(
    (app: TldrawApp) => {
      const newTiddlerText = JSON.stringify(app.document);
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
      <Tldraw onPersist={onChange} document={tldrawDocument} />
    </div>
  );
}
