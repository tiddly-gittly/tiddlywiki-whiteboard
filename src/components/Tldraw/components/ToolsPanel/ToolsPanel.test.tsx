import * as React from 'react';
import { renderWithContext } from '@tldr/test';
import { ToolsPanel } from './ToolsPanel';

describe('tools panel', () => {
  test('mounts component without crashing', () => {
    renderWithContext(<ToolsPanel onBlur={() => void null} />);
  });
});
