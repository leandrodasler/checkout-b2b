type ShowToastArgs = {
  message: string
  horizontalPosition?: 'left' | 'right'
}

export type WithToast<T = unknown> = T & {
  showToast: (args: ShowToastArgs) => void
}

export type TableSchema<RowType> = {
  properties: {
    [key in keyof RowType]?: {
      title: React.ReactNode
      width?: number
      minWidth?: number
      cellRenderer: (args: {
        cellData: RowType[key]
        rowData: RowType
      }) => React.ReactNode
    }
  }
}
