import React from 'react'

type CellWrapperProps = React.PropsWithChildren<{
  isChildren?: boolean | string | null
}>

export function CellWrapper({ children, isChildren }: CellWrapperProps) {
  return <span className={isChildren ? 'c-muted-1' : ''}>{children}</span>
}
