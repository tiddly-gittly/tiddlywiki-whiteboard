import { TLPointerEventHandler, Utils } from '@tldraw/core'
import { Draw } from '@tldr/state/shapes'
import { BaseTool } from '@tldr/state/tools/BaseTool'
import { SessionType, TDShapeType } from '@tldr/types'

enum Status {
  Idle = 'idle',
  Creating = 'creating',
  Extending = 'extending',
  Pinching = 'pinching',
}

export class DrawTool extends BaseTool {
  type = TDShapeType.Draw as const

  private lastShapeId?: string

  onEnter = () => {
    this.lastShapeId = undefined
  }

  onCancel = () => {
    switch (this.status) {
      case Status.Idle: {
        this.app.selectTool('select')
        break
      }
      default: {
        this.setStatus(Status.Idle)
        break
      }
    }

    this.app.cancelSession()
  }

  /* ----------------- Event Handlers ----------------- */

  onPointerDown: TLPointerEventHandler = (info) => {
    if (this.status !== Status.Idle) return
    if (this.app.readOnly) return
    const {
      currentPoint,
      appState: { currentPageId, currentStyle },
    } = this.app
    const previous = this.lastShapeId && this.app.getShape(this.lastShapeId)
    if (info.shiftKey && previous) {
      // Extend the previous shape
      this.app.startSession(SessionType.Draw, previous.id)
      this.setStatus(Status.Extending)
    } else {
      // Create a new shape
      const childIndex = this.getNextChildIndex()
      const id = Utils.uniqueId()
      const newShape = Draw.create({
        id,
        parentId: currentPageId,
        childIndex,
        point: currentPoint,
        style: { ...currentStyle },
      })
      this.lastShapeId = id
      this.app.patchCreate([newShape])
      this.app.startSession(SessionType.Draw, id)
      this.setStatus(Status.Creating)
    }
  }

  onPointerMove: TLPointerEventHandler = () => {
    if (this.app.readOnly) return

    switch (this.status) {
      case Status.Extending:
      case Status.Creating: {
        this.app.updateSession()
      }
    }
  }

  onPointerUp: TLPointerEventHandler = () => {
    this.app.completeSession()
    this.setStatus(Status.Idle)
  }
}
