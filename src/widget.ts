import { IChangedTiddlers } from 'tiddlywiki';
import type { ReactWidget } from 'tw-react';
import { App, IAppProps, TDExportJSON } from './components/App';

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
      readonly: this.getAttribute('readonly') === 'yes' || this.getAttribute('readonly') === 'true',
      isDraft: this.editTitle === undefined ? false : Boolean(this.getAttribute('draftTitle')),
      saver: {
        lock: this.lock,
        onSave: this.onSave,
        interval: SAVE_DEBOUNCE_INTERVAL,
      },
    };
  };

  public refresh(changedTiddlers: IChangedTiddlers): boolean {
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

  editorOperations = {};
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
    const previousText = $tw.wiki.getTiddlerText(this.editTitle, '{}') || '{}';
    // prevent useless call to addTiddler
    if (previousText !== newText) {
      let isSavingNewVersion = false;
      try {
        const newTextVersion = (JSON.parse(newText) as TDExportJSON).updatedCount ?? 0;
        const previousTextVersion = (JSON.parse(previousText) as TDExportJSON).updatedCount ?? 0;
        if (newTextVersion > previousTextVersion) {
          isSavingNewVersion = true;
        }
      } catch (error) {
        console.error(error);
      }
      if (isSavingNewVersion) {
        $tw.wiki.setText(this.editTitle, undefined, undefined, newText);
        // set tiddler type
        $tw.wiki.setText(this.editTitle, 'type', undefined, 'application/tldr');
      }
    }
    this.unlock();
  };

  /** a lock to prevent update from tiddler to slate, when update of tiddler is trigger by slate. */
  private isUpdatingByUserInput = false;
  private updatingLockTimeoutHandle: NodeJS.Timeout | undefined;
  get editIconElement() {
    const element = (this.parentDomNode as HTMLDivElement).closest('.tc-tiddler-exists')?.querySelector('.tc-image-wysiwyg-edit-button');
    return element;
  }

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
