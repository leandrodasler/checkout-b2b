type ShowToastArgs = {
  message: string
  horizontalPosition?: 'left' | 'right'
}

export type WithToast<T = unknown> = T & {
  showToast?: (args: ShowToastArgs) => void
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

export type ApiResponse = {
  code?: string
  message?: string
  response?: { data?: { error?: string } | string }
  error?: { message?: string }
}

export type TransactionResponse = ApiResponse & {
  id: string
  gatewayCallbackTemplatePath: string
  orderGroup: string
}

export type TransactionBody = {
  referenceId: string
  savePersonalData: boolean
  optinNewsLetter: boolean
  value: number
  referenceValue?: number | null
  interestValue?: number | null
}
