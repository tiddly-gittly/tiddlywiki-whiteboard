import { Vec } from '@tldraw/vec';
import { TldrawTestApp, mockDocument } from '@tldr/test';
import { ArrowShape, GroupShape, SessionType, TDShapeType, TDStatus } from '@tldr/types';

describe('Translate session', () => {
  it('begins, updateSession', () => {
    const app = new TldrawTestApp().loadDocument(mockDocument).pointShape('rect1', [5, 5]).movePointer([10, 10]);

    expect(app.getShape('rect1').point).toStrictEqual([5, 5]);

    app.completeSession();

    expect(app.status).toBe(TDStatus.Idle);

    expect(app.getShape('rect1').point).toStrictEqual([5, 5]);

    app.undo();

    expect(app.getShape('rect1').point).toStrictEqual([0, 0]);

    app.redo();

    expect(app.getShape('rect1').point).toStrictEqual([5, 5]);
  });

  it('cancels session', () => {
    const app = new TldrawTestApp().loadDocument(mockDocument).select('rect1', 'rect2').pointBounds([5, 5]).movePointer([10, 10]).cancelSession();

    expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
  });

  it('moves a single shape', () => {
    const app = new TldrawTestApp().loadDocument(mockDocument).pointShape('rect1', [10, 10]).movePointer([20, 20]).completeSession();

    expect(app.getShape('rect1').point).toStrictEqual([10, 10]);
  });

  it('moves a single shape along a locked axis', () => {
    const app = new TldrawTestApp()
      .loadDocument(mockDocument)
      .select('rect1')
      .pointShape('rect1', [10, 10])
      .movePointer({ x: 20, y: 20, shiftKey: true })
      .completeSession();

    expect(app.getShape('rect1').point).toStrictEqual([10, 0]);
  });

  it('moves two shapes', () => {
    const app = new TldrawTestApp().loadDocument(mockDocument).select('rect1', 'rect2').pointBounds([10, 10]).movePointer([20, 20]).completeSession();

    expect(app.getShape('rect1').point).toStrictEqual([10, 10]);
    expect(app.getShape('rect2').point).toStrictEqual([110, 110]);
  });

  it('undos and redos clones', () => {
    const app = new TldrawTestApp()
      .loadDocument(mockDocument)
      .select('rect1', 'rect2')
      .pointBounds([10, 10])
      .movePointer({ x: 20, y: 20, altKey: true })
      .completeSession();

    expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
    expect(app.getShape('rect2').point).toStrictEqual([100, 100]);

    expect(Object.keys(app.getPage().shapes).length).toBe(5);

    app.undo();

    expect(Object.keys(app.getPage().shapes).length).toBe(3);

    app.redo();

    expect(Object.keys(app.getPage().shapes).length).toBe(5);
  });

  it('clones shapes', () => {
    const app = new TldrawTestApp()
      .loadDocument(mockDocument)
      .select('rect1', 'rect2')
      .pointBounds([10, 10])
      .movePointer({ x: 20, y: 20, altKey: true })
      .completeSession();

    expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
    expect(app.getShape('rect2').point).toStrictEqual([100, 100]);

    expect(Object.keys(app.getPage().shapes).length).toBe(5);
  });

  it('destroys clones when last update is not cloning', () => {
    const app = new TldrawTestApp().loadDocument(mockDocument);

    expect(Object.keys(app.getPage().shapes).length).toBe(3);

    app.select('rect1', 'rect2').pointBounds([10, 10]).movePointer({ x: 20, y: 20, altKey: true });

    expect(Object.keys(app.getPage().shapes).length).toBe(5);

    app.movePointer({ x: 20, y: 20, altKey: false });

    expect(Object.keys(app.getPage().shapes).length).toBe(3);

    app.completeSession();

    // Original position + delta
    const rectPoint = app.getShape('rect1').point;
    expect(app.getShape('rect1').point).toStrictEqual(rectPoint);
    expect(app.getShape('rect2').point).toStrictEqual([110, 110]);

    expect(Object.keys(app.page.shapes)).toStrictEqual(['rect1', 'rect2', 'rect3']);
  });

  describe('when translating a child of a group', () => {
    it('translates the shape and updates the groups size / point', () => {
      const app = new TldrawTestApp()
        .loadDocument(mockDocument)
        .select('rect1', 'rect2')
        .group(['rect1', 'rect2'], 'groupA')
        .pointShape('rect1', [10, 10])
        .movePointer({ x: 20, y: 20 })
        .completeSession();

      expect(app.getShape('groupA').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect1').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect2').point).toStrictEqual([110, 110]);

      app.undo();

      expect(app.getShape('groupA').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect2').point).toStrictEqual([100, 100]);

      app.redo();

      expect(app.getShape('groupA').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect1').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect2').point).toStrictEqual([110, 110]);
    });

    it('clones the shape and updates the parent', () => {
      const app = new TldrawTestApp()
        .loadDocument(mockDocument)
        .select('rect1', 'rect2')
        .group(['rect1', 'rect2'], 'groupA')
        .doubleClickShape('rect1')
        .pointShape('rect1', [10, 10])
        .movePointer({ x: 10, y: 10, altKey: true })
        .movePointer({ x: 20, y: 20, altKey: true })
        .completeSession();

      const rectPoint = app.getShape('rect1').point;
      const children = app.getShape<GroupShape>('groupA').children;
      const newShapeId = children[children.length - 1];

      expect(app.getShape('groupA').point).toStrictEqual([0, 0]);
      expect(app.getShape<GroupShape>('groupA').children.length).toBe(3);
      expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect2').point).toStrictEqual([100, 100]);
      expect(app.getShape(newShapeId).point).toStrictEqual(Vec.add(rectPoint, [10, 10]));
      expect(app.getShape(newShapeId).parentId).toBe('groupA');

      app.undo();

      expect(app.getShape('groupA').point).toStrictEqual([0, 0]);
      expect(app.getShape<GroupShape>('groupA').children.length).toBe(2);
      expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect2').point).toStrictEqual([100, 100]);
      expect(app.getShape(newShapeId)).toBeUndefined();

      app.redo();

      expect(app.getShape('groupA').point).toStrictEqual([0, 0]);
      expect(app.getShape<GroupShape>('groupA').children.length).toBe(3);
      expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect2').point).toStrictEqual([100, 100]);
      expect(app.getShape(newShapeId).point).toStrictEqual(Vec.add(rectPoint, [10, 10]));
      expect(app.getShape(newShapeId).parentId).toBe('groupA');
    });
  });

  describe('when translating a shape with children', () => {
    it('translates the shapes children', () => {
      const app = new TldrawTestApp()
        .loadDocument(mockDocument)
        .select('rect1', 'rect2')
        .group(['rect1', 'rect2'], 'groupA')
        .pointShape('groupA', [10, 10])
        .movePointer({ x: 20, y: 20 })
        .completeSession();

      expect(app.getShape('groupA').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect1').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect2').point).toStrictEqual([110, 110]);

      app.undo();

      expect(app.getShape('groupA').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect1').point).toStrictEqual([0, 0]);
      expect(app.getShape('rect2').point).toStrictEqual([100, 100]);

      app.redo();

      expect(app.getShape('groupA').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect1').point).toStrictEqual([10, 10]);
      expect(app.getShape('rect2').point).toStrictEqual([110, 110]);
    });

    it('clones the shapes and children', () => {
      expect(() =>
        new TldrawTestApp()
          .loadDocument(mockDocument)
          .select('rect1', 'rect2')
          .group(['rect1', 'rect2'], 'groupA')
          .pointShape('groupA', [10, 10])
          .movePointer({ x: 20, y: 20, altKey: true })
          .completeSession(),
      ).not.toThrow();
    });

    it('deletes clones and restores them', () => {
      const app = new TldrawTestApp()
        .loadDocument(mockDocument)
        .select('rect1', 'rect2')
        .group(['rect1', 'rect2'], 'groupA')
        .pointShape('groupA', [10, 10])
        .movePointer({ x: 20, y: 20, altKey: true })
        .movePointer({ x: 20, y: 20, altKey: false })
        .movePointer({ x: 20, y: 20, altKey: true })
        .completeSession();

      expect(app.shapes.filter((shape) => shape.type === TDShapeType.Group).length).toBe(2);
    });

    it('deletes clones when not cloning anymore', () => {
      const app = new TldrawTestApp()
        .loadDocument(mockDocument)
        .select('rect1', 'rect2')
        .group(['rect1', 'rect2'], 'groupA')
        .pointShape('groupA', [10, 10])
        .movePointer({ x: 20, y: 20, altKey: true })
        .movePointer({ x: 20, y: 20, altKey: false })
        .completeSession();

      expect(app.shapes.filter((shape) => shape.type === TDShapeType.Group).length).toBe(1);
    });

    it('clones the shapes and children when selecting a group and a different shape', () => {
      expect(() => {
        new TldrawTestApp()
          .loadDocument(mockDocument)
          .select('rect1', 'rect2')
          .group(['rect1', 'rect2'], 'groupA')
          .select('groupA', 'rect3')
          .pointBounds([10, 10])
          .movePointer({ x: 20, y: 20, altKey: true })
          .completeSession();
      }).not.toThrow();
    });
  });
});

describe('When creating with a translate session', () => {
  it('Deletes the shape on undo', () => {
    const app = new TldrawTestApp().selectTool(TDShapeType.Rectangle).pointCanvas([0, 0]).movePointer([10, 10]).completeSession();

    expect(app.shapes.length).toBe(1);

    app.undo();

    expect(app.shapes.length).toBe(0);
  });
});

describe('When snapping', () => {
  it.todo('Does not snap when moving quicky');
  it.todo('Snaps only matching edges when moving slowly');
  it.todo('Snaps any edge to any edge when moving very slowly');
  it.todo('Snaps a clone to its parent');
  it.todo('Cleans up snap lines when cancelled');
  it.todo('Cleans up snap lines when completed');
  it.todo('Cleans up snap lines when starting to clone / not clone');
  it.todo('Snaps the rotated bounding box of rotated shapes');
  it.todo('Snaps to a shape on screen');
  it.todo('Does not snap to a shape off screen.');
  it.todo('Snaps while panning.');
});

describe('When translating linked shapes', () => {
  it.todo('translates all linked shapes when center is dragged');
  it.todo('translates all upstream linked shapes when left is dragged');
  it.todo('translates all downstream linked shapes when right is dragged');
});

it('destroys bindings from the translating shape', () => {
  const app = new TldrawTestApp()
    .loadDocument(mockDocument)
    .selectAll()
    .delete()
    .createShapes(
      { type: TDShapeType.Rectangle, id: 'rect1', point: [200, 200], size: [100, 100] },
      { type: TDShapeType.Rectangle, id: 'rect2', point: [400, 400], size: [100, 100] },
    )
    .selectTool(TDShapeType.Arrow)
    .pointShape('rect1', { x: 251, y: 251 })
    .movePointer([450, 450])
    .completeSession()
    .selectTool('select');

  let arrow: ArrowShape;

  arrow = app.shapes[2] as ArrowShape;

  expect(arrow.type).toBe(TDShapeType.Arrow);

  expect(arrow.handles.start.bindingId).not.toBeUndefined();
  expect(arrow.handles.end.bindingId).not.toBeUndefined();

  expect(app.bindings.length).toBe(2);

  app.pointShape(arrow.id, [300, 300]);
  app.movePointer([0, 0]);
  app.completeSession();

  expect(app.bindings.length).toBe(0);

  arrow = app.shapes[2] as ArrowShape;
  expect(arrow.handles.start.bindingId).toBe(undefined);
  expect(arrow.handles.end.bindingId).toBe(undefined);

  app.undo();

  arrow = app.shapes[2] as ArrowShape;
  expect(app.bindings.length).toBe(2);
  expect(arrow.handles.start.bindingId).not.toBeUndefined();
  expect(arrow.handles.end.bindingId).not.toBeUndefined();

  app.redo();

  arrow = app.shapes[2] as ArrowShape;
  expect(app.bindings.length).toBe(0);
  expect(arrow.handles.start.bindingId).toBe(undefined);
  expect(arrow.handles.end.bindingId).toBe(undefined);
});

it('restores bindings when cancelled', () => {
  const app = new TldrawTestApp()
    .loadDocument(mockDocument)
    .selectAll()
    .delete()
    .createShapes(
      { type: TDShapeType.Rectangle, id: 'rect1', point: [200, 200], size: [100, 100] },
      { type: TDShapeType.Rectangle, id: 'rect2', point: [400, 400], size: [100, 100] },
    )
    .selectTool(TDShapeType.Arrow)
    .pointShape('rect1', { x: 251, y: 251 })
    .movePointer([450, 450])
    .completeSession()
    .selectTool('select');

  let arrow: ArrowShape;

  arrow = app.shapes[2] as ArrowShape;

  expect(arrow.type).toBe(TDShapeType.Arrow);

  expect(arrow.handles.start.bindingId).not.toBeUndefined();
  expect(arrow.handles.end.bindingId).not.toBeUndefined();

  expect(app.bindings.length).toBe(2);

  app.pointShape(arrow.id, [300, 300]);
  app.movePointer([0, 0]);
  app.cancelSession();

  arrow = app.shapes[2] as ArrowShape;
  expect(app.bindings.length).toBe(2);
  expect(arrow.handles.start.bindingId).not.toBeUndefined();
  expect(arrow.handles.end.bindingId).not.toBeUndefined();
});
