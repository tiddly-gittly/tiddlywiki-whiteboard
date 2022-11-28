import { TldrawApp } from '@tldr/state'
import { TriangleTool } from '.'

describe('TriangleTool', () => {
  it('creates tool', () => {
    const app = new TldrawApp()
    new TriangleTool(app)
  })
})
