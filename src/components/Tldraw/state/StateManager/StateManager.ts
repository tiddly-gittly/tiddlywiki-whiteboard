import { Utils } from '@tldraw/core';
import create, { UseBoundStore } from 'zustand';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import type { Command, Patch } from '@tldr/types';
import { deepCopy } from './copy';

export class StateManager<T extends Record<string, any>> {
  /**
   * An ID used to persist state in indexdb.
   */
  protected _idbId?: string;

  /**
   * The initial state.
   */
  private readonly initialState: T;

  /**
   * A zustand store that also holds the state.
   */
  private readonly store: StoreApi<T>;

  /**
   * The index of the current command.
   */
  protected pointer = -1;

  /**
   * The current state.
   */
  private _state: T;

  /**
   * The state manager's current status, with regard to restoring persisted state.
   */
  private _status: 'loading' | 'ready' = 'loading';

  /**
   * A stack of commands used for history (undo and redo).
   */
  protected stack: Array<Command<T>> = [];

  /**
   * A snapshot of the current state.
   */
  protected _snapshot: T;

  /**
   * A React hook for accessing the zustand store.
   */
  public readonly useStore: UseBoundStore<StoreApi<T>>;

  /**
   * A promise that will resolve when the state manager has loaded any peristed state.
   */
  public ready: Promise<'none' | 'restored' | 'migrated'>;

  public isPaused = false;

  constructor(initialState: T, id?: string, version?: number, update?: (previous: T, next: T, previousVersion: number) => T) {
    this._state = deepCopy(initialState);
    this._snapshot = deepCopy(initialState);
    this.initialState = deepCopy(initialState);
    this.store = createVanilla(() => this._state);
    this.useStore = create(this.store);

    this.ready = new Promise<'none' | 'restored' | 'migrated'>((resolve) => {
      let message: 'none' | 'restored' | 'migrated' = 'none';

      if (this._idbId) {
        message = 'restored';

        idb
          .get(this._idbId)
          .then(async (saved) => {
            if (saved) {
              let next = saved;

              if (version) {
                const savedVersion = await idb.get<number>(id + '_version');

                if (savedVersion && savedVersion < version) {
                  next = update == undefined ? initialState : update(saved, initialState, savedVersion);

                  message = 'migrated';
                }
              }

              await idb.set(id + '_version', version || -1);

              // why is this necessary? but it is...
              const previousEmpty = this._state.appState.isEmptyCanvas;

              next = this.migrate(next);

              this._state = deepCopy(next);
              this._snapshot = deepCopy(next);

              this._state.appState.isEmptyCanvas = previousEmpty;
              this.store.setState(this._state, true);
            } else {
              await idb.set(id + '_version', version || -1);
            }
            this._status = 'ready';
            resolve(message);
          })
          .catch((error) => console.error(error));
      } else {
        // We need to wait for any override to `onReady` to take effect.
        this._status = 'ready';
        resolve(message);
      }
    }).then((message) => {
      if (this.onReady != undefined) this.onReady(message);
      return message;
    });
  }

  /**
   * Save the current state to indexdb.
   */
  protected persist = (patch: Patch<T>, id?: string): void | Promise<void> => {
    if (this._status !== 'ready') return;

    if (this.onPersist != undefined) {
      this.onPersist(this._state, patch, id);
    }

    if (this._idbId) {
      return idb.set(this._idbId, this._state).catch((error) => console.error(error));
    }
  };

  /**
   * Apply a patch to the current state.
   * This does not effect the undo/redo stack.
   * This does not persist the state.
   * @param patch The patch to apply.
   * @param id (optional) An id for the patch.
   */
  private readonly applyPatch = (patch: Patch<T>, id?: string) => {
    const previous = this._state;
    const next = Utils.deepMerge(this._state, patch as any);
    const final = this.cleanup(next, previous, patch, id);
    if (this.onStateWillChange != undefined) {
      this.onStateWillChange(final, id);
    }
    this._state = final;
    this.store.setState(this._state, true);
    if (this.onStateDidChange != undefined) {
      this.onStateDidChange(this._state, id);
    }
    return this;
  };

  // Internal API ---------------------------------

  protected migrate = (next: T): T => {
    return next;
  };

  /**
   * Perform any last changes to the state before updating.
   * Override this on your extending class.
   * @param nextState The next state.
   * @param prevState The previous state.
   * @param patch The patch that was just applied.
   * @param id (optional) An id for the just-applied patch.
   * @returns The final new state to apply.
   */
  protected cleanup = (nextState: T, _previousState: T, _patch: Patch<T>, _id?: string): T => nextState;

  /**
   * A life-cycle method called when the state is about to change.
   * @param state The next state.
   * @param id An id for the change.
   */
  protected onStateWillChange?: (state: T, id?: string) => void;

  /**
   * A life-cycle method called when the state has changed.
   * @param state The next state.
   * @param id An id for the change.
   */
  protected onStateDidChange?: (state: T, id?: string) => void;

  /**
   * Apply a patch to the current state.
   * This does not effect the undo/redo stack.
   * This does not persist the state.
   * @param patch The patch to apply.
   * @param id (optional) An id for this patch.
   */
  patchState = (patch: Patch<T>, id?: string): this => {
    this.applyPatch(patch, id);
    if (this.onPatch != undefined) {
      this.onPatch(this._state, patch, id);
    }
    return this;
  };

  /**
   * Replace the current state.
   * This does not effect the undo/redo stack.
   * This does not persist the state.
   * @param state The new state.
   * @param id An id for this change.
   */
  protected replaceState = (state: T, id?: string): this => {
    const final = this.cleanup(state, this._state, state, id);
    if (this.onStateWillChange != undefined) {
      this.onStateWillChange(final, 'replace');
    }
    this._state = final;
    this.store.setState(this._state, true);
    if (this.onStateDidChange != undefined) {
      this.onStateDidChange(this._state, 'replace');
    }
    return this;
  };

  /**
   * Update the state using a Command.
   * This effects the undo/redo stack.
   * This persists the state.
   * @param command The command to apply and add to the undo/redo stack.
   * @param id (optional) An id for this command.
   */
  protected setState = (command: Command<T>, id = command.id) => {
    if (this.pointer < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.pointer + 1);
    }
    this.stack.push({ ...command, id });
    this.pointer = this.stack.length - 1;
    this.applyPatch(command.after, id);
    if (this.onCommand != undefined) this.onCommand(this._state, command, id);
    this.persist(command.after, id);
    return this;
  };

  // Public API ---------------------------------

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  /**
   * A callback fired when the constructor finishes loading any
   * persisted data.
   */
  protected onReady?: (message: 'none' | 'restored' | 'migrated') => void;

  /**
   * A callback fired when a patch is applied.
   */
  public onPatch?: (state: T, patch: Patch<T>, id?: string) => void;

  /**
   * A callback fired when a patch is applied.
   */
  public onCommand?: (state: T, command: Command<T>, id?: string) => void;

  /**
   * A callback fired when the state is persisted.
   */
  public onPersist?: (state: T, patch: Patch<T>, id?: string) => void;

  /**
   * A callback fired when the state is replaced.
   */
  public onReplace?: (state: T) => void;

  /**
   * A callback fired when the state is reset.
   */
  public onReset?: (state: T) => void;

  /**
   * A callback fired when the history is reset.
   */
  public onResetHistory?: (state: T) => void;

  /**
   * A callback fired when a command is undone.
   */
  public onUndo?: (state: T) => void;

  /**
   * A callback fired when a command is redone.
   */
  public onRedo?: (state: T) => void;

  /**
   * Reset the state to the initial state and reset history.
   */
  public reset = () => {
    if (this.onStateWillChange != undefined) {
      this.onStateWillChange(this.initialState, 'reset');
    }
    this._state = this.initialState;
    this.store.setState(this._state, true);
    this.resetHistory();
    this.persist({}, 'reset');
    if (this.onStateDidChange != undefined) {
      this.onStateDidChange(this._state, 'reset');
    }
    if (this.onReset != undefined) {
      this.onReset(this._state);
    }
    return this;
  };

  /**
   * Force replace a new undo/redo history. It's your responsibility
   * to make sure that this is compatible with the current state!
   * @param history The new array of commands.
   * @param pointer (optional) The new pointer position.
   */
  public replaceHistory = (history: Array<Command<T>>, pointer = history.length - 1): this => {
    this.stack = history;
    this.pointer = pointer;
    if (this.onReplace != undefined) {
      this.onReplace(this._state);
    }
    return this;
  };

  /**
   * Reset the history stack (without resetting the state).
   */
  public resetHistory = (): this => {
    this.stack = [];
    this.pointer = -1;
    if (this.onResetHistory != undefined) {
      this.onResetHistory(this._state);
    }
    return this;
  };

  /**
   * Move backward in the undo/redo stack.
   */
  public undo = (): this => {
    if (!this.isPaused) {
      if (!this.canUndo) return this;
      const command = this.stack[this.pointer];
      this.pointer--;
      this.applyPatch(command.before, `undo`);
      this.persist(command.before, 'undo');
    }
    if (this.onUndo != undefined) this.onUndo(this._state);
    return this;
  };

  /**
   * Move forward in the undo/redo stack.
   */
  public redo = (): this => {
    if (!this.isPaused) {
      if (!this.canRedo) return this;
      this.pointer++;
      const command = this.stack[this.pointer];
      this.applyPatch(command.after, 'redo');
      this.persist(command.after, 'undo');
    }
    if (this.onRedo != undefined) this.onRedo(this._state);
    return this;
  };

  /**
   * Save a snapshot of the current state, accessible at `this.snapshot`.
   */
  public setSnapshot = (): this => {
    this._snapshot = { ...this._state };
    return this;
  };

  /**
   * Force the zustand state to update.
   */
  public forceUpdate = () => {
    this.store.setState(this._state, true);
  };

  /**
   * Get whether the state manager can undo.
   */
  public get canUndo(): boolean {
    return this.pointer > -1;
  }

  /**
   * Get whether the state manager can redo.
   */
  public get canRedo(): boolean {
    return this.pointer < this.stack.length - 1;
  }

  /**
   * The current state.
   */
  public get state(): T {
    return this._state;
  }

  /**
   * The current status.
   */
  public get status(): string {
    return this._status;
  }

  /**
   * The most-recent snapshot.
   */
  protected get snapshot(): T {
    return this._snapshot;
  }
}
