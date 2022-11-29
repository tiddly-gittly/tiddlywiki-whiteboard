import * as React from 'react';
import { useDialog, useTldrawApp } from '@tldr/hooks';

export function useFileSystemHandlers() {
  const app = useTldrawApp();

  const { openDialog } = useDialog();

  const onNewProject = React.useCallback(
    async (e?: React.MouseEvent | React.KeyboardEvent | KeyboardEvent) => {
      if (e != undefined && app.callbacks.onOpenProject != undefined) e.preventDefault();
      app.callbacks.onNewProject?.(app, openDialog);
    },
    [app, openDialog],
  );

  const onSaveProject = React.useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent | KeyboardEvent) => {
      if (e != undefined && app.callbacks.onOpenProject != undefined) e.preventDefault();
      app.callbacks.onSaveProject?.(app);
    },
    [app],
  );

  const onSaveProjectAs = React.useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent | KeyboardEvent) => {
      if (e != undefined && app.callbacks.onOpenProject != undefined) e.preventDefault();
      app.callbacks.onSaveProjectAs?.(app);
    },
    [app],
  );

  const onOpenMedia = React.useCallback(
    async (e?: React.MouseEvent | React.KeyboardEvent | KeyboardEvent) => {
      if (e != undefined && app.callbacks.onOpenMedia != undefined) e.preventDefault();
      app.callbacks.onOpenMedia?.(app);
    },
    [app],
  );

  return {
    onNewProject,
    onSaveProject,
    onSaveProjectAs,
    onOpenMedia,
  };
}
