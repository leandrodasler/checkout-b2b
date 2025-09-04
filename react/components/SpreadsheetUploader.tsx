import React, { ChangeEvent, useState } from 'react'
import { Button, Input } from 'vtex.styleguide'

import { useUploadSpreadsheet } from '../hooks/useUploadSpreadSheet'

export function UploadSpreadsheetForm() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadSpreadsheet, { loading }] = useUploadSpreadsheet()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      await uploadSpreadsheet({
        variables: { file },
      })
    } catch (err) {
      console.error('Erro ao enviar arquivo:', err)
    }
  }

  return (
    <div className="flex flex-column gap-4">
      <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        variation="primary"
      >
        {loading ? 'Enviando...' : 'Enviar arquivo'}
      </Button>
    </div>
  )
}
