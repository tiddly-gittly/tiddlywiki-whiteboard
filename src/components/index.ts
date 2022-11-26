import type { ReactWidget } from 'tw-react';
import { App, IAppProps } from './tldraw';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const Widget = require('$:/plugins/linonetwo/tw-react/widget.js').widget as typeof ReactWidget;

class TldrawWhiteBoardWidget extends Widget<IAppProps> {
  reactComponent = App;
  getProps = () => ({ stateTiddler: this.getAttribute('stateTiddler') });
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
exports.whiteboard = TldrawWhiteBoardWidget;
