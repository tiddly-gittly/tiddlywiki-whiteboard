declare module '$:/plugins/linonetwo/tw-react/widget.js' {
  import type { FullReactDomType, IReactWidget, ITWReactProps, ITWReactPropsDefault } from 'tw-react';
  import type { widget as Widget } from '$:/core/modules/widgets/widget.js';
  import type * as ReactType from 'react';

  export abstract class widget<
    IProps extends ITWReactProps = ITWReactPropsDefault,
  > extends Widget implements IReactWidget<IProps> {
    root?: ReturnType<FullReactDomType['createRoot']> | undefined;
    containerElement?: HTMLDivElement | undefined;
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
  export * from 'tw-react';
}
