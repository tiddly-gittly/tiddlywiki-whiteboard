import { TldrawApp } from '@tldr/state';
import { ArrowTool } from '.';

describe('ArrowTool', () => {
  it('creates tool', () => {
    const app = new TldrawApp();
    new ArrowTool(app);
  });
});
