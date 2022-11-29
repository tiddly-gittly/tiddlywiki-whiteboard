import * as React from 'react';
import type { TldrawApp } from '@tldr/state';
import { DialogState } from './useDialog';

export function useFileSystem() {
  const onNewProject = React.useCallback(
    async (
      app: TldrawApp,
      openDialog: (dialogState: DialogState, onYes: () => Promise<void>, onNo: () => Promise<void>, onCancel: () => Promise<void>) => void,
    ) => {
      openDialog(
        app.fileSystemHandle == undefined ? 'saveAgain' : 'saveFirstTime',
        async () => {
          // user pressed yes
          try {
            await app.saveProject();
            app.newProject();
          } catch {
            // noop
          }
        },
        async () => {
          // user pressed no
          app.newProject();
        },
        async () => {
          // user pressed cancel
        },
      );
    },
    [],
  );

  const onSaveProject = React.useCallback((app: TldrawApp) => {
    app.saveProject();
  }, []);

  const onSaveProjectAs = React.useCallback((app: TldrawApp) => {
    app.saveProjectAs();
  }, []);

  const onOpenMedia = React.useCallback(async (app: TldrawApp) => {
    app.openAsset?.();
  }, []);

  return {
    onNewProject,
    onSaveProject,
    onSaveProjectAs,
    onOpenMedia,
  };
}
