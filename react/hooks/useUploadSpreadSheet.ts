import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'

import UploadSpreadsheetMutation from '../graphql/uploadSpreadsheet.graphql'
import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useToast } from './useToast'

export function useUploadSpreadsheet() {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation(UploadSpreadsheetMutation, {
    onError: showToast,
    onCompleted({ uploadSpreadsheet }) {
      showToast({
        message: formatMessage(messages.importSpreadsheetSuccess),
      })

      setOrderForm({
        ...orderForm,
        ...uploadSpreadsheet,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })
    },
  })
}
