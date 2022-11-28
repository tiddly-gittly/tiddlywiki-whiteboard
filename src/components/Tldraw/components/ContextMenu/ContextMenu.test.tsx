import * as React from 'react';
import { renderWithContext, renderWithIntlProvider } from '@tldr/test';
import { ContextMenu } from './ContextMenu';

describe('context menu', () => {
  test('mounts component without crashing', () => {
    renderWithContext(
      renderWithIntlProvider(
        <ContextMenu onBlur={jest.fn()}>
          <div>Hello</div>
        </ContextMenu>,
      ),
    );
  });
});
