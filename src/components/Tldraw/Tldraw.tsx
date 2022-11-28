import { CursorComponent, Renderer } from '@tldraw/core';
import * as React from 'react';
import { ErrorBoundary as _Errorboundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';
import { ContextMenu } from '@tldr/components/ContextMenu';
import { ErrorFallback } from '@tldr/components/ErrorFallback';
import { FocusButton } from '@tldr/components/FocusButton';
import { Loading } from '@tldr/components/Loading';
import { AlertDialog } from '@tldr/components/Primitives/AlertDialog';
import { ToolsPanel } from '@tldr/components/ToolsPanel';
import { TopPanel } from '@tldr/components/TopPanel';
import { GRID_SIZE } from '@tldr/constants';
import {
  AlertDialogContext,
  ContainerContext,
  DialogState,
  TldrawContext,
  useKeyboardShortcuts,
  useStylesheet,
  useTldrawApp,
  useTranslation,
} from '@tldr/hooks';
import { useCursor } from '@tldr/hooks/useCursor';
import { TDCallbacks, TldrawApp } from '@tldr/state';
import { TLDR } from '@tldr/state/TLDR';
import { shapeUtils } from '@tldr/state/shapes';
import { dark, styled } from '@tldr/styles';
import { TDDocument, TDStatus } from '@tldr/types';

const ErrorBoundary = _Errorboundary as any;

export interface TldrawProps extends TDCallbacks {
  /**
   * (optional) Whether the editor should immediately receive focus. Defaults to true.
   */
  autofocus?: boolean;

  /**
   * (optional) Custom components to override parts of the default UI.
   */
  components?: {
    /**
     * The component to render for multiplayer cursors.
     */
    Cursor?: CursorComponent;
  };

  /**
   * (optional) The current page id.
   */
  currentPageId?: string;

  /**
   * (optional) Whether to to show the app's dark mode UI.
   */
  darkMode?: boolean;

  /**
   * (optional) If provided, image/video componnets will be disabled.
   *
   * Warning: Keeping this enabled for multiplayer applications without provifing a storage
   * bucket based solution will cause massive base64 string to be written to the liveblocks room.
   */
  disableAssets?: boolean;

  /**
   * (optional) The document to load or update from.
   */
  document?: TDDocument;

  /**
   * (optional) To hide cursors
   */
  hideCursors?: boolean;

  /**
   * (optional) If provided, the component will load / persist state under this key.
   */
  id?: string;

  /**
   * (optional) Whether to the document should be read only.
   */
  readOnly?: boolean;

  /**
   * (optional) Whether to show the menu UI.
   */
  showMenu?: boolean;

  /**
   * (optional) Whether to show the multiplayer menu.
   */
  showMultiplayerMenu?: boolean;

  /**
   * (optional) Whether to show the pages UI.
   */
  showPages?: boolean;

  /**
   * (optional) Whether to show the styles UI.
   */
  showStyles?: boolean;

  /**
   * (optional) Whether to show the tools UI.
   */
  showTools?: boolean;

  /**
   * (optional) Whether to show the UI.
   */
  showUI?: boolean;

  /**
   * (optional) Whether to show the zoom UI.
   */
  showZoom?: boolean;
}

const isSystemDarkMode = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;

export function Tldraw({
  id,
  document,
  currentPageId,
  autofocus = true,
  showMenu = true,
  showMultiplayerMenu = true,
  showPages = true,
  showTools = true,
  showZoom = true,
  showStyles = true,
  showUI = true,
  readOnly = false,
  disableAssets = false,
  darkMode = isSystemDarkMode,
  components,
  onMount,
  onChange,
  onChangePresence,
  onNewProject,
  onSaveProject,
  onSaveProjectAs,
  onOpenProject,
  onOpenMedia,
  onUndo,
  onRedo,
  onPersist,
  onPatch,
  onCommand,
  onChangePage,
  onAssetCreate,
  onAssetDelete,
  onAssetUpload,
  onSessionStart,
  onSessionEnd,
  onExport,
  hideCursors,
}: TldrawProps) {
  const [sId, setSId] = React.useState(id);

  // Create a new app when the component mounts.
  const [app, setApp] = React.useState(() => {
    const app = new TldrawApp(id, {
      onMount,
      onChange,
      onChangePresence,
      onNewProject,
      onSaveProject,
      onSaveProjectAs,
      onOpenProject,
      onOpenMedia,
      onUndo,
      onRedo,
      onPersist,
      onPatch,
      onCommand,
      onChangePage,
      onAssetDelete,
      onAssetCreate,
      onAssetUpload,
      onSessionStart,
      onSessionEnd,
    });
    return app;
  });

  const [onCancel, setOnCancel] = React.useState<(() => void) | null>(null);
  const [onYes, setOnYes] = React.useState<(() => void) | null>(null);
  const [onNo, setOnNo] = React.useState<(() => void) | null>(null);
  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);

  const openDialog = React.useCallback((dialogState: DialogState, onYes: () => void, onNo: () => void, onCancel: () => void) => {
    setDialogState(() => dialogState);
    setOnCancel(() => onCancel);
    setOnYes(() => onYes);
    setOnNo(() => onNo);
  }, []);

  // Create a new app if the `id` prop changes.
  React.useLayoutEffect(() => {
    if (id === sId) return;
    const newApp = new TldrawApp(id, {
      onMount,
      onChange,
      onChangePresence,
      onNewProject,
      onSaveProject,
      onSaveProjectAs,
      onOpenProject,
      onOpenMedia,
      onUndo,
      onRedo,
      onPersist,
      onPatch,
      onCommand,
      onChangePage,
      onAssetDelete,
      onAssetCreate,
      onAssetUpload,
      onExport,
      onSessionStart,
      onSessionEnd,
    });

    setSId(id);

    setApp(newApp);
  }, [sId, id]);

  // Update the document if the `document` prop changes but the ids,
  // are the same, or else load a new document if the ids are different.
  React.useEffect(() => {
    if (document == undefined) return;

    if (document.id === app.document.id) {
      app.updateDocument(document);
    } else {
      app.loadDocument(document);
    }
  }, [document, app]);

  // Disable assets when the `disableAssets` prop changes.
  React.useEffect(() => {
    app.setDisableAssets(disableAssets);
  }, [app, disableAssets]);

  // Change the page when the `currentPageId` prop changes.
  React.useEffect(() => {
    if (!currentPageId) return;
    app.changePage(currentPageId);
  }, [currentPageId, app]);

  // Toggle the app's readOnly mode when the `readOnly` prop changes.
  React.useEffect(() => {
    app.readOnly = readOnly;
    if (!readOnly) {
      app.selectNone();
      app.cancelSession();
      app.setEditingId();
    }
  }, [app, readOnly]);

  // Toggle the app's darkMode when the `darkMode` prop changes.
  React.useEffect(() => {
    if (darkMode !== app.settings.isDarkMode) {
      app.toggleDarkMode();
    }
  }, [app, darkMode]);

  // Update the app's callbacks when any callback changes.
  React.useEffect(() => {
    app.callbacks = {
      onMount,
      onChange,
      onChangePresence,
      onNewProject,
      onSaveProject,
      onSaveProjectAs,
      onOpenProject,
      onOpenMedia,
      onUndo,
      onRedo,
      onPersist,
      onPatch,
      onCommand,
      onChangePage,
      onAssetDelete,
      onAssetCreate,
      onAssetUpload,
      onExport,
      onSessionStart,
      onSessionEnd,
    };
  }, [
    onMount,
    onChange,
    onChangePresence,
    onNewProject,
    onSaveProject,
    onSaveProjectAs,
    onOpenProject,
    onOpenMedia,
    onUndo,
    onRedo,
    onPersist,
    onPatch,
    onCommand,
    onChangePage,
    onAssetDelete,
    onAssetCreate,
    onAssetUpload,
    onExport,
    onSessionStart,
    onSessionEnd,
  ]);

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.document?.fonts) return;

    function refreshBoundingBoxes() {
      app.refreshBoundingBoxes();
    }
    window.document.fonts.addEventListener('loadingdone', refreshBoundingBoxes);
    return () => {
      window.document.fonts.removeEventListener('loadingdone', refreshBoundingBoxes);
    };
  }, [app]);

  // Use the `key` to ensure that new selector hooks are made when the id changes
  return (
    <TldrawContext.Provider value={app}>
      <AlertDialogContext.Provider value={{ onYes, onCancel, onNo, dialogState, setDialogState, openDialog }}>
        <InnerTldraw
          key={sId || 'Tldraw'}
          id={sId}
          autofocus={autofocus}
          showPages={showPages}
          showMenu={showMenu}
          showMultiplayerMenu={showMultiplayerMenu}
          showStyles={showStyles}
          showZoom={showZoom}
          showTools={showTools}
          showUI={showUI}
          readOnly={readOnly}
          components={components}
          hideCursors={hideCursors}
        />
      </AlertDialogContext.Provider>
    </TldrawContext.Provider>
  );
}

interface InnerTldrawProps {
  autofocus: boolean;
  components?: {
    Cursor?: CursorComponent;
  };
  hideCursors?: boolean;
  id?: string;
  readOnly: boolean;
  showMenu: boolean;
  showMultiplayerMenu: boolean;
  showPages: boolean;
  showStyles: boolean;
  showTools: boolean;
  showUI: boolean;
  showZoom: boolean;
}

const InnerTldraw = React.memo(function InnerTldraw({
  id,
  autofocus,
  showPages,
  showMenu,
  showMultiplayerMenu,
  showZoom,
  showStyles,
  showTools,
  readOnly,
  showUI,
  components,
  hideCursors,
}: InnerTldrawProps) {
  const app = useTldrawApp();
  const [dialogContainer, setDialogContainer] = React.useState<any>(null);
  const rWrapper = React.useRef<HTMLDivElement>(null);

  const state = app.useStore();

  const { document, settings, appState, room } = state;

  const isSelecting = state.appState.activeTool === 'select';

  const page = document.pages[appState.currentPageId];
  const pageState = document.pageStates[page.id];
  const assets = document.assets;
  const { selectedIds } = pageState;

  const isHideBoundsShape = selectedIds.length === 1 && page.shapes[selectedIds[0]] && TLDR.getShapeUtil(page.shapes[selectedIds[0]].type).hideBounds;

  const isHideResizeHandlesShape =
    selectedIds.length === 1 && page.shapes[selectedIds[0]] && TLDR.getShapeUtil(page.shapes[selectedIds[0]].type).hideResizeHandles;

  // Custom rendering meta, with dark mode for shapes
  const meta = React.useMemo(() => {
    return { isDarkMode: settings.isDarkMode };
  }, [settings.isDarkMode]);

  const showDashedBrush = settings.isCadSelectMode ? !appState.selectByContain : appState.selectByContain;

  // Custom theme, based on darkmode
  const theme = React.useMemo(() => {
    const { selectByContain } = appState;
    const { isDarkMode, isCadSelectMode } = settings;

    if (isDarkMode) {
      const brushBase = isCadSelectMode ? (selectByContain ? '69, 155, 255' : '105, 209, 73') : '180, 180, 180';
      return {
        brushFill: `rgba(${brushBase}, ${isCadSelectMode ? 0.08 : 0.05})`,
        brushStroke: `rgba(${brushBase}, ${isCadSelectMode ? 0.5 : 0.25})`,
        brushDashStroke: `rgba(${brushBase}, .6)`,
        selected: 'rgba(38, 150, 255, 1.000)',
        selectFill: 'rgba(38, 150, 255, 0.05)',
        background: '#212529',
        foreground: '#49555f',
      };
    }

    const brushBase = isCadSelectMode ? (selectByContain ? '0, 89, 242' : '51, 163, 23') : '0,0,0';

    return {
      brushFill: `rgba(${brushBase}, ${isCadSelectMode ? 0.08 : 0.05})`,
      brushStroke: `rgba(${brushBase}, ${isCadSelectMode ? 0.4 : 0.25})`,
      brushDashStroke: `rgba(${brushBase}, .6)`,
    };
  }, [settings.isDarkMode, settings.isCadSelectMode, appState.selectByContain]);

  const isInSession = app.session !== undefined;

  // Hide bounds when not using the select tool, or when the only selected shape has handles
  const hideBounds = (isInSession && app.session?.constructor.name !== 'BrushSession') || !isSelecting || isHideBoundsShape || !!pageState.editingId;

  // Hide bounds when not using the select tool, or when in session
  const hideHandles = isInSession || !isSelecting;

  // Hide indicators when not using the select tool, or when in session
  const hideIndicators = (isInSession && state.appState.status !== TDStatus.Brushing) || !isSelecting;

  const hideCloneHandles = isInSession || !isSelecting || pageState.camera.zoom < 0.2;

  const translation = useTranslation(settings.language);

  // Put the theme on the body. This means that components with
  // multiple editors cannot have different themes.
  React.useLayoutEffect(() => {
    const elm = rWrapper.current;
    if (elm == undefined) return;
    if (settings.isDarkMode) {
      elm.classList.add(dark);
    } else {
      elm.classList.remove(dark);
    }
  }, [settings.isDarkMode]);

  useCursor(rWrapper);

  return (
    <ContainerContext.Provider value={rWrapper}>
      <IntlProvider locale={translation.locale} messages={translation.messages}>
        <AlertDialog container={dialogContainer} />
        <StyledLayout ref={rWrapper} tabIndex={-0}>
          <Loading />
          <OneOff focusableRef={rWrapper} autofocus={autofocus} />
          <ContextMenu>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Renderer
                id={id}
                containerRef={rWrapper}
                shapeUtils={shapeUtils}
                page={page}
                pageState={pageState}
                assets={assets}
                snapLines={appState.snapLines}
                eraseLine={appState.eraseLine}
                grid={GRID_SIZE}
                users={room?.users}
                userId={room?.userId}
                theme={theme}
                meta={meta}
                components={components}
                hideCursors={hideCursors}
                hideBounds={hideBounds}
                hideHandles={hideHandles}
                hideResizeHandles={isHideResizeHandlesShape}
                hideIndicators={hideIndicators}
                hideBindingHandles={!settings.showBindingHandles}
                hideCloneHandles={hideCloneHandles}
                hideRotateHandles={!settings.showRotateHandles}
                hideGrid={!settings.showGrid}
                showDashedBrush={showDashedBrush}
                performanceMode={app.session?.performanceMode}
                onPinchStart={app.onPinchStart}
                onPinchEnd={app.onPinchEnd}
                onPinch={app.onPinch}
                onPan={app.onPan}
                onZoom={app.onZoom}
                onPointerDown={app.onPointerDown}
                onPointerMove={app.onPointerMove}
                onPointerUp={app.onPointerUp}
                onPointCanvas={app.onPointCanvas}
                onDoubleClickCanvas={app.onDoubleClickCanvas}
                onRightPointCanvas={app.onRightPointCanvas}
                onDragCanvas={app.onDragCanvas}
                onReleaseCanvas={app.onReleaseCanvas}
                onPointShape={app.onPointShape}
                onDoubleClickShape={app.onDoubleClickShape}
                onRightPointShape={app.onRightPointShape}
                onDragShape={app.onDragShape}
                onHoverShape={app.onHoverShape}
                onUnhoverShape={app.onUnhoverShape}
                onReleaseShape={app.onReleaseShape}
                onPointBounds={app.onPointBounds}
                onDoubleClickBounds={app.onDoubleClickBounds}
                onRightPointBounds={app.onRightPointBounds}
                onDragBounds={app.onDragBounds}
                onHoverBounds={app.onHoverBounds}
                onUnhoverBounds={app.onUnhoverBounds}
                onReleaseBounds={app.onReleaseBounds}
                onPointBoundsHandle={app.onPointBoundsHandle}
                onDoubleClickBoundsHandle={app.onDoubleClickBoundsHandle}
                onRightPointBoundsHandle={app.onRightPointBoundsHandle}
                onDragBoundsHandle={app.onDragBoundsHandle}
                onHoverBoundsHandle={app.onHoverBoundsHandle}
                onUnhoverBoundsHandle={app.onUnhoverBoundsHandle}
                onReleaseBoundsHandle={app.onReleaseBoundsHandle}
                onPointHandle={app.onPointHandle}
                onDoubleClickHandle={app.onDoubleClickHandle}
                onRightPointHandle={app.onRightPointHandle}
                onDragHandle={app.onDragHandle}
                onHoverHandle={app.onHoverHandle}
                onUnhoverHandle={app.onUnhoverHandle}
                onReleaseHandle={app.onReleaseHandle}
                onError={app.onError}
                onRenderCountChange={app.onRenderCountChange}
                onShapeChange={app.onShapeChange}
                onShapeBlur={app.onShapeBlur}
                onShapeClone={app.onShapeClone}
                onBoundsChange={app.updateBounds}
                onKeyDown={app.onKeyDown}
                onKeyUp={app.onKeyUp}
                onDragOver={app.onDragOver}
                onDrop={app.onDrop}
              />
            </ErrorBoundary>
          </ContextMenu>
          {showUI && (
            <StyledUI ref={setDialogContainer}>
              {settings.isFocusMode ? (
                <FocusButton onSelect={app.toggleFocusMode} />
              ) : (
                <>
                  <TopPanel
                    readOnly={readOnly}
                    showPages={showPages}
                    showMenu={showMenu}
                    showMultiplayerMenu={showMultiplayerMenu}
                    showStyles={showStyles}
                    showZoom={showZoom}
                  />
                  <StyledSpacer />
                  {showTools && !readOnly && <ToolsPanel />}
                </>
              )}
            </StyledUI>
          )}
        </StyledLayout>
      </IntlProvider>
    </ContainerContext.Provider>
  );
});

const OneOff = React.memo(function OneOff({ focusableRef, autofocus }: { autofocus?: boolean; focusableRef: React.RefObject<HTMLDivElement> }) {
  useKeyboardShortcuts(focusableRef);
  useStylesheet();

  React.useEffect(() => {
    if (autofocus) {
      focusableRef.current?.focus();
    }
  }, [autofocus]);

  return null;
});

const StyledLayout = styled('div', {
  position: 'absolute',
  height: '100%',
  width: '100%',
  minHeight: 0,
  minWidth: 0,
  maxHeight: '100%',
  maxWidth: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  outline: 'none',

  '& .tl-container': {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 1,
  },

  '& input, textarea, button, select, label, button': {
    webkitTouchCallout: 'none',
    webkitUserSelect: 'none',
    '-webkit-tap-highlight-color': 'transparent',
    'tap-highlight-color': 'transparent',
  },
});

const StyledUI = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  padding: '8px 8px 0 8px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  pointerEvents: 'none',
  zIndex: 2,
  '& > *': {
    pointerEvents: 'all',
  },
});

const StyledSpacer = styled('div', {
  flexGrow: 2,
});
