import { useMutation } from 'react-apollo'

import UploadSpreadsheetMutation from '../graphql/uploadSpreadsheet.graphql'
import { useToast } from './useToast'

interface UploadSpreadsheetResult {
  uploadSpreadsheet: {
    filename: string
    mimetype: string
    encoding: string
  }
}

interface UploadSpreadsheetVariables {
  file: File
}

export function useUploadSpreadsheet() {
  const showToast = useToast()

  return useMutation<UploadSpreadsheetResult, UploadSpreadsheetVariables>(
    UploadSpreadsheetMutation,
    {
      onError({ message }) {
        showToast({ message })
      },
      onCompleted({ uploadSpreadsheet }) {
        showToast({
          message: `Arquivo "${uploadSpreadsheet.filename}" enviado com sucesso!`,
        })
      },
    }
  )
}
