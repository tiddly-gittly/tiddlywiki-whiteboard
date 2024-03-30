/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="widget-type.d.ts" />
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '$:/plugins/linonetwo/tw-react/widget.js' {
  import type { IReactWidget, ITWReactProps, ITWReactPropsDefault } from 'tw-react/widget-type';
  import type { Widget } from 'tiddlywiki';
  import type * as ReactType from 'react';
  // import type * as ReactDomType from 'react-dom';
  import type * as ReactDomClientType from 'react-dom/client';

  export abstract class widget<
    IProps extends ITWReactProps = ITWReactPropsDefault,
  > extends Widget implements IReactWidget<IProps> {
    root?: ReturnType<typeof ReactDomClientType['createRoot']> | undefined;
    containerElement?: HTMLDivElement | undefined;
    destroy(): void;
    getProps?: () => IProps;
    /**
     * User of tw-react need to assign his react component to this property.
     */
    reactComponent:
      | ReactType.ClassType<any, ReactType.ClassicComponent<any, ReactType.ComponentState>, ReactType.ClassicComponentClass<any>>
      | ReactType.FunctionComponent<any>
      | ReactType.ComponentClass<any>
      | null;
  }
}

declare module '$:/plugins/linonetwo/tw-react/index.js' {
  export * from 'tw-react/dist/lib/hooks';
  export * from 'tw-react/dist/lib/widget-type';
}
