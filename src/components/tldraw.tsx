import { Tldraw } from '@tldraw/tldraw';
import './tldraw.css';

export interface IAppProps {
  height?: string;
  /**
   * Tiddler to contain the serialized JSON component state
   */
  stateTiddler: string;
  width?: string;
}

export function App(props: IAppProps): JSX.Element {
  const { height, width } = props;
  return (
    <div className="tw-whiteboard-tldraw-container" style={{ height, width }}>
      <Tldraw />
    </div>
  );
}
