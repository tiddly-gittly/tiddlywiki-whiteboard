import type {
  TLAsset,
  TLBinding,
  TLBoundsCorner,
  TLBoundsEdge,
  TLBoundsEventHandler,
  TLBoundsHandleEventHandler,
  TLCanvasEventHandler,
  TLHandle,
  TLKeyboardEventHandler,
  TLPage,
  TLPageState,
  TLPinchEventHandler,
  TLPointerEventHandler,
  TLShape,
  TLShapeBlurHandler,
  TLShapeCloneHandler,
  TLSnapLine,
  TLUser,
  TLWheelEventHandler,
} from '@tldraw/core';
import { TDLanguage } from '@tldr/translations';

/* -------------------------------------------------- */
/*                         App                        */
/* -------------------------------------------------- */

// A base class for all classes that handle events from the Renderer,
// including TDApp and all Tools.
export class TDEventHandler {
  onPinchStart?: TLPinchEventHandler;
  onPinchEnd?: TLPinchEventHandler;
  onPinch?: TLPinchEventHandler;
  onKeyDown?: TLKeyboardEventHandler;
  onKeyUp?: TLKeyboardEventHandler;
  onPointerMove?: TLPointerEventHandler;
  onPointerUp?: TLPointerEventHandler;
  onPan?: TLWheelEventHandler;
  onZoom?: TLWheelEventHandler;
  onPointerDown?: TLPointerEventHandler;
  onPointCanvas?: TLCanvasEventHandler;
  onDoubleClickCanvas?: TLCanvasEventHandler;
  onRightPointCanvas?: TLCanvasEventHandler;
  onDragCanvas?: TLCanvasEventHandler;
  onReleaseCanvas?: TLCanvasEventHandler;
  onPointShape?: TLPointerEventHandler;
  onDoubleClickShape?: TLPointerEventHandler;
  onRightPointShape?: TLPointerEventHandler;
  onDragShape?: TLPointerEventHandler;
  onHoverShape?: TLPointerEventHandler;
  onUnhoverShape?: TLPointerEventHandler;
  onReleaseShape?: TLPointerEventHandler;
  onPointBounds?: TLBoundsEventHandler;
  onDoubleClickBounds?: TLBoundsEventHandler;
  onRightPointBounds?: TLBoundsEventHandler;
  onDragBounds?: TLBoundsEventHandler;
  onHoverBounds?: TLBoundsEventHandler;
  onUnhoverBounds?: TLBoundsEventHandler;
  onReleaseBounds?: TLBoundsEventHandler;
  onPointBoundsHandle?: TLBoundsHandleEventHandler;
  onDoubleClickBoundsHandle?: TLBoundsHandleEventHandler;
  onRightPointBoundsHandle?: TLBoundsHandleEventHandler;
  onDragBoundsHandle?: TLBoundsHandleEventHandler;
  onHoverBoundsHandle?: TLBoundsHandleEventHandler;
  onUnhoverBoundsHandle?: TLBoundsHandleEventHandler;
  onReleaseBoundsHandle?: TLBoundsHandleEventHandler;
  onPointHandle?: TLPointerEventHandler;
  onDoubleClickHandle?: TLPointerEventHandler;
  onRightPointHandle?: TLPointerEventHandler;
  onDragHandle?: TLPointerEventHandler;
  onHoverHandle?: TLPointerEventHandler;
  onUnhoverHandle?: TLPointerEventHandler;
  onReleaseHandle?: TLPointerEventHandler;
  onShapeBlur?: TLShapeBlurHandler;
  onShapeClone?: TLShapeCloneHandler;
}

export type TDDockPosition = 'bottom' | 'left' | 'right' | 'top';

// The shape of the TldrawApp's React (zustand) store
export interface TDSnapshot {
  appState: {
    activeTool: TDToolType;
    currentPageId: string;
    currentStyle: ShapeStyles;
    disableAssets: boolean;
    eraseLine: number[][];
    hoveredId?: string;
    isEmptyCanvas: boolean;
    isLoading: boolean;
    isMenuOpen: boolean;
    isToolLocked: boolean;
    selectByContain?: boolean;
    snapLines: TLSnapLine[];
    status: string;
  };
  document: TDDocument;
  room?: {
    id: string;
    userId: string;
    users: Record<string, TDUser>;
  };
  settings: {
    dockPosition: TDDockPosition;
    exportBackground: TDExportBackground;
    isCadSelectMode: boolean;
    isDarkMode: boolean;
    isDebugMode: boolean;
    isFocusMode: boolean;
    isPenMode: boolean;
    nudgeDistanceSmall: number
    nudgeDistanceLarge: number
    isZoomSnap: boolean,
    isSnapping: boolean;
    language: TDLanguage,
    showBindingHandles: boolean
    showCloneHandles: boolean
    showGrid: boolean
    showRotateHandles: boolean,
    isReadonlyMode: boolean;
    keepStyleMenuOpen: boolean,
  };
}

export type TldrawPatch = Patch<TDSnapshot>;

export type TldrawCommand = Command<TDSnapshot>;

// The shape of the files stored in JSON
export interface TDFile {
  assets: Record<string, unknown>;
  document: TDDocument;
  fileHandle: FileSystemFileHandle | null;
  name: string;
}

// The shape of the Tldraw document
export interface TDDocument {
  assets: TDAssets;
  id: string;
  name: string;
  pageStates: Record<string, TLPageState>;
  pages: Record<string, TDPage>;
  version: number;
}

// The shape of a single page in the Tldraw document
export type TDPage = TLPage<TDShape, TDBinding>;

// A partial of a TDPage, used for commands / patches
export interface PagePartial {
  bindings: Patch<TDPage['bindings']>;
  shapes: Patch<TDPage['shapes']>;
}

// The meta information passed to TDShapeUtil components
export interface TDMeta {
  isDarkMode: boolean;
}

// The type of info given to shapes when transforming
export interface TransformInfo<T extends TLShape> {
  initialShape: T;
  scaleX: number;
  scaleY: number;
  transformOrigin: number[];
  type: TLBoundsEdge | TLBoundsCorner;
}

// The status of a TDUser
export enum TDUserStatus {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
  Idle = 'idle',
}

// A TDUser, for multiplayer rooms
export interface TDUser extends TLUser {
  activeShapes: TDShape[];
  session?: boolean;
  status: TDUserStatus;
}

export type Theme = 'dark' | 'light';

export enum SessionType {
  Arrow = 'arrow',
  Brush = 'brush',
  Draw = 'draw',
  Edit = 'edit',
  Erase = 'erase',
  Grid = 'grid',
  Handle = 'handle',
  Rotate = 'rotate',
  Transform = 'transform',
  TransformSingle = 'transformSingle',
  Translate = 'translate',
}

export enum TDStatus {
  Brushing = 'brushing',
  Creating = 'creating',
  EditingText = 'editing-text',
  Idle = 'idle',
  Pinching = 'pinching',
  PointingBounds = 'pointingBounds',
  PointingBoundsHandle = 'pointingBoundsHandle',
  PointingHandle = 'pointingHandle',
  Rotating = 'rotating',
  Transforming = 'transforming',
  Translating = 'translating',
  TranslatingHandle = 'translatingHandle',
  TranslatingLabel = 'translatingLabel'
}

export type TDToolType =
  | 'select'
  | 'erase'
  | TDShapeType.Text
  | TDShapeType.Draw
  | TDShapeType.Ellipse
  | TDShapeType.Rectangle
  | TDShapeType.Triangle
  | TDShapeType.Line
  | TDShapeType.Arrow
  | TDShapeType.Sticky;

export type Easing =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo';

export enum MoveType {
  Backward = 'backward',
  Forward = 'forward',
  ToBack = 'toBack',
  ToFront = 'toFront',
}

export enum AlignType {
  Bottom = 'bottom',
  CenterHorizontal = 'centerHorizontal',
  CenterVertical = 'centerVertical',
  Left = 'left',
  Right = 'right',
  Top = 'top',
}

export enum StretchType {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum DistributeType {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum FlipType {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/* -------------------------------------------------- */
/*                       Shapes                       */
/* -------------------------------------------------- */

export enum TDShapeType {
  Arrow = 'arrow',
  Draw = 'draw',
  Ellipse = 'ellipse',
  Group = 'group',
  Image = 'image',
  Line = 'line',
  Rectangle = 'rectangle',
  Sticky = 'sticky',
  Text = 'text',
  Triangle = 'triangle',
  Video = 'video',
}

export enum Decoration {
  Arrow = 'arrow',
}

export interface TDBaseShape extends TLShape {
  handles?: Record<string, TDHandle>;
  label?: string;
  style: ShapeStyles;
  type: TDShapeType;
}

export interface DrawShape extends TDBaseShape {
  isComplete: boolean;
  points: number[][];
  type: TDShapeType.Draw;
}

// The extended handle (used for arrows)
export interface TDHandle extends TLHandle {
  bindingId?: string;
  canBind?: boolean;
}

export interface RectangleShape extends TDBaseShape {
  label?: string;
  labelPoint?: number[];
  size: number[];
  type: TDShapeType.Rectangle;
}

export interface EllipseShape extends TDBaseShape {
  label?: string;
  labelPoint?: number[];
  radius: number[];
  type: TDShapeType.Ellipse;
}

export interface TriangleShape extends TDBaseShape {
  label?: string;
  labelPoint?: number[];
  size: number[];
  type: TDShapeType.Triangle;
}

// The shape created with the arrow tool
export interface ArrowShape extends TDBaseShape {
  bend: number;
  decorations?: {
    end?: Decoration;
    middle?: Decoration;
    start?: Decoration;
  };
  handles: {
    bend: TDHandle;
    end: TDHandle;
    start: TDHandle;
  };
  label?: string;
  labelPoint?: number[];
  type: TDShapeType.Arrow;
}

export interface ArrowBinding extends TLBinding {
  distance: number;
  handleId: keyof ArrowShape['handles'];
  point: number[];
}

export type TDBinding = ArrowBinding;

export interface ImageShape extends TDBaseShape {
  assetId: string;
  size: number[];
  type: TDShapeType.Image;
}

export interface VideoShape extends TDBaseShape {
  assetId: string;
  currentTime: number;
  isPlaying: boolean;
  size: number[];
  type: TDShapeType.Video;
}

// The shape created by the text tool
export interface TextShape extends TDBaseShape {
  text: string;
  type: TDShapeType.Text;
}

// The shape created by the sticky tool
export interface StickyShape extends TDBaseShape {
  size: number[];
  text: string;
  type: TDShapeType.Sticky;
}

// The shape created when multiple shapes are grouped
export interface GroupShape extends TDBaseShape {
  children: string[];
  size: number[];
  type: TDShapeType.Group;
}

// A union of all shapes
export type TDShape = RectangleShape | EllipseShape | TriangleShape | DrawShape | ArrowShape | TextShape | GroupShape | StickyShape | ImageShape | VideoShape;

/* ------------------ Shape Styles ------------------ */

export enum ColorStyle {
  Black = 'black',
  Blue = 'blue',
  Cyan = 'cyan',
  Gray = 'gray',
  Green = 'green',
  Indigo = 'indigo',
  LightGray = 'lightGray',
  Orange = 'orange',
  Red = 'red',
  Violet = 'violet',
  White = 'white',
  Yellow = 'yellow',
}

export enum SizeStyle {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

export enum DashStyle {
  Dashed = 'dashed',
  Dotted = 'dotted',
  Draw = 'draw',
  Solid = 'solid',
}

export enum FontSize {
  ExtraLarge = 'extraLarge',
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

export enum AlignStyle {
  End = 'end',
  Justify = 'justify',
  Middle = 'middle',
  Start = 'start',
}

export enum FontStyle {
  Mono = 'mono',
  Sans = 'sans',
  Script = 'script',
  Serif = 'serif',
}

export interface ShapeStyles {
  color: ColorStyle;
  dash: DashStyle;
  font?: FontStyle;
  isFilled?: boolean;
  scale?: number;
  size: SizeStyle;
  textAlign?: AlignStyle;
}

export enum TDAssetType {
  Image = 'image',
  Video = 'video',
}

export interface TDImageAsset extends TLAsset {
  fileName: string;
  size: number[];
  src: string;
  type: TDAssetType.Image;
}

export interface TDVideoAsset extends TLAsset {
  fileName: string;
  size: number[];
  src: string;
  type: TDAssetType.Video;
}

export type TDAsset = TDImageAsset | TDVideoAsset;

export type TDAssets = Record<string, TDAsset>;

/* -------------------------------------------------- */
/*                    Export                          */
/* -------------------------------------------------- */

export enum TDExportType {
  JPG = 'jpeg',
  JSON = 'json',
  PNG = 'png',
  SVG = 'svg',
  WEBP = 'webp',
}

export interface TDExport {
  blob: Blob;
  name: string;
  type: string;
}

export enum TDExportBackground {
  Auto = 'auto',
  Dark = 'dark',
  Light = 'light',
  Transparent = 'transparent',
}

/* -------------------------------------------------- */
/*                    Type Helpers                    */
/* -------------------------------------------------- */

export type ParametersExceptFirst<F> = F extends (argument0: any, ...rest: infer R) => any ? R : never;

export type ExceptFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

export type ExceptFirstTwo<T extends unknown[]> = T extends [any, any, ...infer U] ? U : never;

export type PropsOfType<U> = {
  [K in keyof TDShape]: TDShape[K] extends any ? (TDShape[K] extends U ? K : never) : never;
}[keyof TDShape];

export type Difference<A, B, C = A> = A extends B ? never : C;

export type Intersection<A, B, C = A> = A extends B ? C : never;

export type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: Difference<Record<string, unknown>, Pick<T, K>, K>;
}[keyof T];

export type MembersWithRequiredKey<T, U> = {
  [P in keyof T]: Intersection<U, RequiredKeys<T[P]>, T[P]>;
}[keyof T];

export type MappedByType<U extends string, T extends { type: U }> = {
  [P in T['type']]: T extends any ? (P extends T['type'] ? T : never) : never;
};

export type ShapesWithProp<U> = MembersWithRequiredKey<MappedByType<TDShapeType, TDShape>, U>;

export type Patch<T> = Partial<{ [P in keyof T]: Patch<T[P]> }>;

export interface Command<T extends { [key: string]: any }> {
  after: Patch<T>;
  before: Patch<T>;
  id?: string;
}

export interface FileWithHandle extends File {
  handle?: FileSystemFileHandle;
}

export interface FileWithDirectoryHandle extends File {
  directoryHandle?: FileSystemDirectoryHandle;
}

// The following typings implement the relevant parts of the File System Access
// API. This can be removed once the specification reaches the Candidate phase
// and is implemented as part of microsoft/TSJS-lib-generator.

export interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

export interface FileSystemHandle {
  isSameEntry: (other: FileSystemHandle) => Promise<boolean>;
  readonly kind: 'file' | 'directory';

  readonly name: string;

  queryPermission: (descriptor?: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
  requestPermission: (descriptor?: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
}
