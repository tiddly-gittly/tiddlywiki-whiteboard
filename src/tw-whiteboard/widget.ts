/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import 'requestidlecallback-polyfill';
import { widget as Widget } from '$:/plugins/linonetwo/tw-react/widget.js';
import { IChangedTiddlers } from 'tiddlywiki';
import { App, IAppProps } from './components/App';

const SAVE_DEBOUNCE_INTERVAL = 1000;

class TldrawWhiteBoardWidget extends Widget<IAppProps> {
  public reactComponent = App;
  public getProps = () => {
    return {
      currentTiddler: this.editTitle,
      initialTiddlerText: this.editTitle === undefined ? '' : $tw.wiki.getTiddlerText(this.editTitle),
      height: this.getAttribute('height'),
      width: this.getAttribute('width'),
      readonly: this.getAttribute('readonly') === 'yes' || this.getAttribute('readonly') === 'true',
      zoomToFit: this.getAttribute('zoomToFit') !== 'no' && this.getAttribute('zoomToFit') === 'false',
      zoom: this.getAttribute('zoom'),
      isDraft: this.editTitle === undefined ? false : Boolean(this.getAttribute('draftTitle')),
      locale: $tw.wiki.getTiddlerText('$:/language') === '$:/languages/zh-Hans' ? 'zh-cn' : 'en',
      isDarkMode: $tw.wiki.getTiddler($tw.wiki.getTiddlerText('$:/palette') ?? '')?.fields?.['color-scheme'] === 'dark',
      onReady: this.onReady,
      saver: {
        lock: this.lock,
        onSave: this.onSave,
        interval: SAVE_DEBOUNCE_INTERVAL,
      },
    };
  };

  private ready = false;
  private readonly onReady = () => {
    // refresh the widget when tldraw editor is not init yet will cause error (for example when a script auto switch palette on startup). So we wait here until it is ready.
    this.ready = true;
  };

  public refresh(changedTiddlers: IChangedTiddlers): boolean {
    if (!this.ready) return false;
    if (changedTiddlers['$:/state/Whiteboard/PageLayout/focusedTiddler'] || changedTiddlers['$:/palette'] || changedTiddlers['$:/language']) {
      this.refreshSelf();
      return true;
    }
    if (this.editTitle === undefined) return false;
    if (changedTiddlers[this.editTitle]?.deleted === true) {
      // this delete operation will trigger the close of the tiddler, so trigger the save, we have to prevent that
      this.lock();
      return false;
    }
    // if tiddler change is triggered by react, then skip the update of slate
    if (this.isUpdatingByUserInput) {
      return false;
    }
    const changedAttributes = this.computeAttributes();
    if ($tw.utils.count(changedAttributes) > 0 || changedTiddlers[this.editTitle]?.modified === true) {
      this.refreshSelf();
      return true;
    }
    return false;
  }

  private editTitle: string | undefined;

  execute() {
    /** don't use `this.getVariable('currentTiddler')` otherwise it will overwrite the widget. */
    this.editTitle = this.getAttribute('tiddler');
    // Make the child widgets
    this.makeChildWidgets();
  }

  private readonly onSave = (newText: string): void => {
    /** if tiddler field is not filled in, just edit in the memory, don't save */
    if (this.editTitle === '' || this.editTitle === undefined) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const previousTiddler = $tw.wiki.getTiddler(this.editTitle);
    // prevent useless call to addTiddler
    if (previousTiddler?.fields.text !== newText) {
      // use setText for DraftTiddler, otherwise if use addTiddler we will make it a real tiddler immediately.
      $tw.wiki.setText(this.editTitle, 'text', undefined, newText);
      // set tiddler type
      $tw.wiki.setText(this.editTitle, 'type', undefined, 'application/vnd.tldraw+json');
    }
    this.unlock();
  };

  /** a lock to prevent update from tiddler to slate, when update of tiddler is trigger by slate. */
  private isUpdatingByUserInput = false;
  private updatingLockTimeoutHandle: NodeJS.Timeout | undefined;

  lock = () => {
    this.isUpdatingByUserInput = true;
    if (this.updatingLockTimeoutHandle !== undefined) {
      clearTimeout(this.updatingLockTimeoutHandle);
    }
  };

  unlock = () => {
    this.updatingLockTimeoutHandle = setTimeout(() => {
      this.isUpdatingByUserInput = false;
    }, SAVE_DEBOUNCE_INTERVAL);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
exports.whiteboard = TldrawWhiteBoardWidget;
