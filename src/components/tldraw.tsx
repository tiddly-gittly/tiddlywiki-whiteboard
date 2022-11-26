/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useState, useEffect } from 'react';
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
    initialTiddlerText,
    saver: { onSave },
  } = props;
  const [tldrawDocument, tldrawDocumentSetter] = useState<TDDocument | undefined>();
  useEffect(() => {
    if (initialTiddlerText) {
      try {
        tldrawDocumentSetter(JSON.parse(initialTiddlerText) as TDDocument);
      } catch {}
    }
  }, [initialTiddlerText]);
  const debouncedSaveOnChange = useDebouncedCallback(
    (app: TldrawApp) => {
      const newTiddlerText = JSON.stringify(app.document);
      onSave(newTiddlerText);
    },
    [],
    debounceSaveTime,
  );
  const onChange = (app: TldrawApp) => {
    tldrawDocumentSetter(app.document);
    debouncedSaveOnChange(app);
  };
  return (
    <div className="tw-whiteboard-tldraw-container" style={{ height, width }}>
      <Tldraw onPersist={onChange} document={tldrawDocument} />
    </div>
  );
}
