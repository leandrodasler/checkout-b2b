/* eslint-disable no-console */
import React, { useRef } from 'react'
import { Button } from 'vtex.styleguide'

import { useUploadSpreadsheet } from '../hooks/useUploadSpreadSheet'

export function UploadSpreadsheetButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadSpreadsheet, { loading }] = useUploadSpreadsheet()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    console.log('arquivo:', file.name)
    console.log('tipo:', file.type)
    console.log('tamanho:', file.size)
    console.log('file', file)

    try {
      const result = await uploadSpreadsheet({ variables: { file } })

      console.log('Upload result:', result)
    } catch (error) {
      console.error('Error uploading spreadsheet:', error)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variation="primary"
        size="small"
        onClick={() => fileInputRef.current?.click()}
        isLoading={loading}
      >
        Importar Excel2
      </Button>
    </>
  )
}
