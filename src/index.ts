import type { Widget as IWidget, IChangedTiddlers } from 'tiddlywiki';

const Widget = (require('$:/core/modules/widgets/widget.js') as { widget: typeof IWidget }).widget;

class ExampleWidget extends Widget {
  // constructor(parseTreeNode: any, options: any) {
  //   super(parseTreeNode, options);
  // }

  refresh(_changedTiddlers: IChangedTiddlers): boolean {
    return false;
  }

  /**
   * Lifecycle method: Render this widget into the DOM
   */
  render(parent: Node, _nextSibling: Node): void {
    this.parentDomNode = parent;
    this.execute();

    const containerElement = document.createElement('div');
    this.domNodes.push(containerElement);
    // eslint-disable-next-line unicorn/prefer-dom-node-append
    parent.appendChild(containerElement);
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
exports.widget = ExampleWidget;
exports.ExampleWidget = ExampleWidget;
