import { TLKeyboardEventHandler, TLPinchEventHandler, TLPointerEventHandler, Utils } from '@tldraw/core';
import type { TldrawApp } from '@tldr/state/TldrawApp';
import { TDEventHandler, TDToolType } from '@tldr/types';

export enum Status {
  Creating = 'creating',
  Idle = 'idle',
  Pinching = 'pinching',
}

export abstract class BaseTool<T extends string = any> extends TDEventHandler {
  type: TDToolType = 'select' as const;

  previous?: TDToolType;

  status: Status | T = Status.Idle;

  constructor(public app: TldrawApp) {
    super();
  }

  protected readonly setStatus = (status: Status | T) => {
    this.status = status;
    this.app.setStatus(this.status as string);
  };

  onEnter = () => {
    this.setStatus(Status.Idle);
  };

  onExit = () => {
    this.setStatus(Status.Idle);
  };

  onCancel = () => {
    if (this.status === Status.Idle) {
      this.app.selectTool('select');
    } else {
      this.setStatus(Status.Idle);
    }

    this.app.cancelSession();
  };

  getNextChildIndex = () => {
    const {
      shapes,
      appState: { currentPageId },
    } = this.app;

    return shapes.length === 0 ? 1 : shapes.filter((shape) => shape.parentId === currentPageId).sort((a, b) => b.childIndex - a.childIndex)[0].childIndex + 1;
  };

  /* --------------------- Camera --------------------- */

  onPinchStart: TLPinchEventHandler = () => {
    this.app.cancelSession();
    this.setStatus(Status.Pinching);
  };

  onPinchEnd: TLPinchEventHandler = () => {
    if (Utils.isMobileSafari()) {
      this.app.undoSelect();
    }
    this.setStatus(Status.Idle);
  };

  onPinch: TLPinchEventHandler = (info, e) => {
    if (this.status !== 'pinching') return;
    if (isNaN(info.delta[0]) || isNaN(info.delta[1])) return;
    this.app.pinchZoom(info.point, info.delta, info.delta[2]);
    this.onPointerMove?.(info, e as unknown as React.PointerEvent);
  };

  /* ---------------------- Keys ---------------------- */

  onKeyDown: TLKeyboardEventHandler = (key) => {
    if (key === 'Escape') {
      this.onCancel();
      return;
    }

    if (key === 'Meta' || key === 'Control' || key === 'Alt') {
      this.app.updateSession();
    }
  };

  onKeyUp: TLKeyboardEventHandler = (key) => {
    if (key === 'Meta' || key === 'Control' || key === 'Alt') {
      this.app.updateSession();
    }
  };

  /* --------------------- Pointer -------------------- */

  onPointerMove: TLPointerEventHandler = () => {
    if (this.status === Status.Creating) {
      this.app.updateSession();
    }
  };

  onPointerUp: TLPointerEventHandler = () => {
    if (this.status === Status.Creating) {
      this.app.completeSession();

      const { isToolLocked } = this.app.appState;

      if (!isToolLocked) {
        this.app.selectTool('select');
      }
    }

    this.setStatus(Status.Idle);
  };
}
