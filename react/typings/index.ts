type ShowToastArgs = {
  message: string
  horizontalPosition?: 'left' | 'right'
}

export type WithToast<T = unknown> = T & {
  showToast: (args: ShowToastArgs) => void
}
