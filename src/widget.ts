import { IChangedTiddlers } from 'tiddlywiki';
import type { ReactWidget } from 'tw-react';
import { App, IAppProps } from './components/App';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const Widget = require('$:/plugins/linonetwo/tw-react/widget.js').widget as typeof ReactWidget;

const SAVE_DEBOUNCE_INTERVAL = 1000;

class TldrawWhiteBoardWidget extends Widget<IAppProps> {
  public reactComponent = App;
  public getProps = () => {
    return {
      currentTiddler: this.editTitle ?? this.getVariable('currentTiddler'),
      initialTiddlerText: this.editTitle === undefined ? '' : $tw.wiki.getTiddlerText(this.editTitle),
      height: this.getAttribute('height'),
      width: this.getAttribute('width'),
      saver: {
        onSave: this.onSave,
        interval: SAVE_DEBOUNCE_INTERVAL,
      },
    };
  };

  public refresh(changedTiddlers: IChangedTiddlers): boolean {
    const changedAttributes = this.computeAttributes();
    if ($tw.utils.count(changedAttributes) > 0 || (this.editTitle !== undefined && changedTiddlers[this.editTitle] !== undefined)) {
      this.refreshSelf();
      return true;
    }
    return false;
  }

  private readonly currentTiddler: string | undefined;
  editorOperations = {};
  private editTitle: string | undefined;
  private editField: string | undefined;
  private editIndex: string | undefined;
  private editDefault: string | undefined;
  private editClass: string | undefined;
  private editMinHeight: string | undefined;
  private editTabIndex: string | undefined;
  private isDisabled: string | undefined;
  private isFileDropEnabled: boolean | undefined;

  execute() {
    // Get our editor parameters, like in slate-write
    /** don't use `this.getVariable('currentTiddler')` otherwise it will overwrite the widget. */
    this.editTitle = this.getAttribute('tiddler');
    this.editField = this.getAttribute('field', 'text');
    this.editIndex = this.getAttribute('index');
    this.editDefault = this.getAttribute('default');
    this.editClass = this.getAttribute('class');
    this.editMinHeight = this.getAttribute('minHeight', '100px');
    this.editTabIndex = this.getAttribute('tabindex');
    this.isDisabled = this.getAttribute('disabled', 'no');
    this.isFileDropEnabled = this.getAttribute('fileDrop', 'no') === 'yes';
    // Get the default editor element tag and type (textarea or div) (not implemented)

    // Make the child widgets
    this.makeChildWidgets();
  }

  private readonly onSave = (newText: string): void => {
    /** if tiddler field is not filled in, just edit in the memory, don't save */
    if (this.editTitle === '' || this.editTitle === undefined) {
      return;
    }
    const previousText = $tw.wiki.getTiddlerText(this.editTitle) ?? '';
    // prevent useless call to addTiddler
    if (previousText === newText) {
      return;
    }
    $tw.wiki.setText(this.editTitle, undefined, undefined, newText);
    // set tiddler type
    $tw.wiki.setText(this.editTitle, 'type', undefined, 'application/tldr');
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
exports.whiteboard = TldrawWhiteBoardWidget;
