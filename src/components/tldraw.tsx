import { Tldraw } from '@tldraw/tldraw';

export interface IAppProps {
  /**
   * Tiddler to contain the serialized JSON component state
   */
  stateTiddler: string;
}

export function App(props: IAppProps): JSX.Element {
  return (
    <div className="tldraw">
      <Tldraw />
    </div>
  );
}
