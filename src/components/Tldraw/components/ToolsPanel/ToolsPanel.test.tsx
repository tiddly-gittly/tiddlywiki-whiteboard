import * as React from 'react';
import { renderWithContext, renderWithIntlProvider } from '@tldr/test';
import { ToolsPanel } from './ToolsPanel';

describe('tools panel', () => {
  test('mounts component without crashing', () => {
    renderWithContext(renderWithIntlProvider(<ToolsPanel onBlur={() => void null} />));
  });
});
