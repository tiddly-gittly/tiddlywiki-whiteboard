import * as React from 'react';
import { useTldrawApp } from '@tldr/hooks';

export function useFileSystemHandlers() {
  const app = useTldrawApp();

  const onOpenMedia = React.useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent | KeyboardEvent) => {
      if (event !== undefined && app.callbacks.onOpenMedia !== undefined) event.preventDefault();
      app.callbacks.onOpenMedia?.(app);
    },
    [app],
  );

  return {
    onOpenMedia,
  };
}
