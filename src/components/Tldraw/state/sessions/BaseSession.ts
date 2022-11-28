import type { TLPerformanceMode } from '@tldraw/core';
import type { TldrawApp } from '@tldr/state/TldrawApp';
import type { SessionType, TldrawCommand, TldrawPatch } from '@tldr/types';

export abstract class BaseSession {
  abstract type: SessionType;
  abstract performanceMode: TLPerformanceMode | undefined;
  constructor(public app: TldrawApp) {}
  abstract start: () => TldrawPatch | undefined;
  abstract update: () => TldrawPatch | undefined;
  abstract complete: () => TldrawPatch | TldrawCommand | undefined;
  abstract cancel: () => TldrawPatch | undefined;
}
