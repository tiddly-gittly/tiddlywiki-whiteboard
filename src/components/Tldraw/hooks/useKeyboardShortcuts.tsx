/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useFileSystemHandlers, useTldrawApp } from '@tldr/hooks';
import { AlignStyle, TDShapeType } from '@tldr/types';

export function useKeyboardShortcuts(reference: React.RefObject<HTMLDivElement>) {
  const app = useTldrawApp();
  const hotKeySetting = {}; // { scopes: app.document?.id };

  const canHandleEvent = React.useCallback(
    (ignoreMenus = false) => {
      const containerElement = reference.current;
      if (!app.isMouseInBound) return false;
      if (ignoreMenus && (app.isMenuOpen || app.settings.keepStyleMenuOpen)) return true;
      // elm?.focus();
      return containerElement !== null && (document.activeElement === containerElement || containerElement.contains(document.activeElement));
    },
    [reference, app],
  );

  // browser don't allow hijack ctrl+c
  React.useEffect(() => {
    if (!app) return;

    const handleCut = (event: ClipboardEvent) => {
      if (!canHandleEvent(true)) return;

      if (app.readOnly) {
        app.copy(undefined, event);
        return;
      }

      app.cut(undefined, event);
    };

    const handleCopy = (event: ClipboardEvent) => {
      if (!canHandleEvent(true)) return;

      app.copy(undefined, event);
    };

    const handlePaste = (event: ClipboardEvent) => {
      if (!canHandleEvent(true)) return;
      if (app.readOnly) return;

      void app.paste(undefined, event);
    };

    reference.current?.addEventListener('cut', handleCut);
    reference.current?.addEventListener('copy', handleCopy);
    reference.current?.addEventListener('paste', handlePaste);
    return () => {
      reference.current?.removeEventListener('cut', handleCut);
      reference.current?.removeEventListener('copy', handleCopy);
      reference.current?.removeEventListener('paste', handlePaste);
    };
  }, [app]);

  /* ---------------------- Tools --------------------- */

  useHotkeys(
    'v,1',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool('select');
    },
    hotKeySetting,
    [app, reference.current],
  ).current = reference.current;

  useHotkeys(
    'd,p,2',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Draw);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'e,3',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool('erase');
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'r,4',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Rectangle);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'o,5',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Ellipse);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'g,6',
    () => {
      if (!canHandleEvent()) return;
      app.selectTool(TDShapeType.Triangle);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'l,7',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Line);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'a,8',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Arrow);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    't,9',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Text);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    's,0',
    () => {
      if (!canHandleEvent(true)) return;
      app.selectTool(TDShapeType.Sticky);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  /* ---------------------- Misc ---------------------- */

  // Focus Mode

  useHotkeys(
    'ctrl+.,⌘+.',
    () => {
      if (!canHandleEvent(true)) return;
      app.toggleFocusMode();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'ctrl+shift+g,⌘+shift+g',
    () => {
      if (!canHandleEvent(true)) return;
      app.toggleGrid();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // File System

  const { onOpenMedia } = useFileSystemHandlers();

  useHotkeys(
    'ctrl+u,⌘+u',
    (event) => {
      if (!canHandleEvent()) return;
      onOpenMedia(event);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Undo Redo

  useHotkeys(
    '⌘+z,ctrl+z',
    (event) => {
      event?.preventDefault();
      event?.stopPropagation();
      if (!canHandleEvent(true)) return;

      if (app.session === undefined) {
        app.undo();
      } else {
        app.cancelSession();
      }
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'ctrl+shift+z,⌘+shift+z',
    () => {
      if (!canHandleEvent(true)) return;

      if (app.session === undefined) {
        app.redo();
      } else {
        app.cancelSession();
      }
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Undo Redo

  useHotkeys(
    '⌘+u,ctrl+u',
    () => {
      if (!canHandleEvent()) return;
      app.undoSelect();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'ctrl+shift-u,⌘+shift+u',
    () => {
      if (!canHandleEvent()) return;
      app.redoSelect();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  /* -------------------- Commands -------------------- */

  // Camera

  useHotkeys(
    'ctrl+=,⌘+=,ctrl+num_add,⌘+num_add',
    (event) => {
      if (!canHandleEvent(true)) return;
      app.zoomIn();
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'ctrl+-,⌘+-,ctrl+num_subtract,⌘+num_subtract',
    (event) => {
      if (!canHandleEvent(true)) return;

      app.zoomOut();
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+0,ctrl+numpad_0,⌘+numpad_0',
    () => {
      if (!canHandleEvent(true)) return;
      app.resetZoom();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+1',
    () => {
      if (!canHandleEvent(true)) return;
      app.zoomToFit();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+2',
    () => {
      if (!canHandleEvent(true)) return;
      app.zoomToSelection();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Duplicate

  useHotkeys(
    'ctrl+d,⌘+d',
    (event) => {
      if (!canHandleEvent()) return;

      app.duplicate();
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Flip

  useHotkeys(
    'shift+h',
    () => {
      if (!canHandleEvent(true)) return;
      app.flipHorizontal();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+v',
    () => {
      if (!canHandleEvent(true)) return;
      app.flipVertical();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Cancel

  useHotkeys(
    'escape',
    () => {
      if (!canHandleEvent(true)) return;

      app.cancel();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Delete

  useHotkeys(
    'backspace,del',
    () => {
      if (!canHandleEvent()) return;
      app.delete();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Select All

  useHotkeys(
    '⌘+a,ctrl+a',
    (event) => {
      if (!canHandleEvent(true)) return;
      event.preventDefault();
      app.selectAll();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Nudge

  useHotkeys(
    'up',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([0, -1], false);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'right',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([1, 0], false);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'down',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([0, 1], false);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'left',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([-1, 0], false);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+up',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([0, -1], true);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+right',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([1, 0], true);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+down',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([0, 1], true);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+left',
    () => {
      if (!canHandleEvent()) return;
      app.nudge([-1, 0], true);
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    '⌘+shift+l,ctrl+shift+l',
    () => {
      if (!canHandleEvent()) return;
      app.toggleLocked();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Copy, Cut & Paste is done on the top of this file

  // Group & Ungroup

  useHotkeys(
    '⌘+g,ctrl+g',
    (event) => {
      if (!canHandleEvent()) return;
      event?.preventDefault();
      event?.stopPropagation();

      app.group();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    '⌘+shift+g,ctrl+shift+g',
    (event) => {
      if (!canHandleEvent()) return;
      event?.preventDefault();
      event?.stopPropagation();

      app.ungroup();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Move

  useHotkeys(
    '[',
    () => {
      if (!canHandleEvent(true)) return;
      app.moveBackward();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    ']',
    () => {
      if (!canHandleEvent(true)) return;
      app.moveForward();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+[',
    () => {
      if (!canHandleEvent(true)) return;
      app.moveToBack();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'shift+]',
    () => {
      if (!canHandleEvent(true)) return;
      app.moveToFront();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'ctrl+shift+backspace,⌘+shift+backspace',
    (event) => {
      if (!canHandleEvent()) return;
      if (app.settings.isDebugMode) {
        app.resetDocument();
      }
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  // Text Align

  useHotkeys(
    'alt+command+l,alt+ctrl+l',
    (event) => {
      if (!canHandleEvent(true)) return;
      app.style({ textAlign: AlignStyle.Start });
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'alt+command+t,alt+ctrl+t',
    (event) => {
      if (!canHandleEvent(true)) return;
      app.style({ textAlign: AlignStyle.Middle });
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;

  useHotkeys(
    'alt+command+r,alt+ctrl+r',
    (event) => {
      if (!canHandleEvent(true)) return;
      app.style({ textAlign: AlignStyle.End });
      event?.preventDefault();
      event?.stopPropagation();
    },
    hotKeySetting,
    [app],
  ).current = reference.current;
}
