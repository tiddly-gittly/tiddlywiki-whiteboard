import * as React from 'react';
import type { TldrawApp } from '@tldr/state';

export function useFileSystem() {
  const onOpenMedia = React.useCallback(async (app: TldrawApp) => {
    await app.openAsset?.();
  }, []);

  return {
    onOpenMedia,
  };
}
