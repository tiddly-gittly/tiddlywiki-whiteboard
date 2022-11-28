import * as React from 'react'
import type { TldrawApp } from '@tldr/state'

export const TldrawContext = React.createContext<TldrawApp>({} as TldrawApp)

const useForceUpdate = () => {
  const [_state, setState] = React.useState(0)
  React.useEffect(() => setState(1))
}

export function useTldrawApp() {
  const context = React.useContext(TldrawContext)
  return context
}

export const ContainerContext = React.createContext({} as React.RefObject<HTMLDivElement>)

export function useContainer() {
  const context = React.useContext(ContainerContext)
  useForceUpdate()
  return context
}
