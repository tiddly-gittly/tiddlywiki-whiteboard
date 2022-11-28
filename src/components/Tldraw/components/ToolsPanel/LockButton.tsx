import { LockClosedIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import * as React from 'react';
import { ToolButton } from '@tldr/components/Primitives/ToolButton';
import { Tooltip } from '@tldr/components/Primitives/Tooltip';
import { useTldrawApp } from '@tldr/hooks';
import type { TDSnapshot } from '@tldr/types';

const isToolLockedSelector = (s: TDSnapshot) => s.appState.isToolLocked;

export function LockButton() {
  const app = useTldrawApp();

  const isToolLocked = app.useStore(isToolLockedSelector);

  return (
    <Tooltip label="Lock Tool" kbd="7" id="TD-Lock">
      <ToolButton variant="circle" isActive={isToolLocked} onSelect={app.toggleToolLock}>
        {isToolLocked ? <LockClosedIcon /> : <LockOpen1Icon />}
      </ToolButton>
    </Tooltip>
  );
}
