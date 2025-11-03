import React from 'react'

type CellWrapperProps = React.PropsWithChildren<{
  isChildren?: boolean | string | null
}>

export function CellWrapper({ children, isChildren }: CellWrapperProps) {
  return <span className={isChildren ? 'c-muted-1' : ''}>{children}</span>
}

type SelectedWrapperProps = React.PropsWithChildren<{
  isSelected?: boolean
}>

export function SelectedWrapper({
  children,
  isSelected,
}: SelectedWrapperProps) {
  if (isSelected) {
    return (
      <div className="absolute flex items-center w-100 h-100 left-0 top-0 ph4 bg-washed-blue">
        {children}
      </div>
    )
  }

  return <>{children}</>
}
