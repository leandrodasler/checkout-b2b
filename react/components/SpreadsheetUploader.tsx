import React, { ChangeEvent, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import {
  Button,
  ButtonWithIcon,
  IconUpload,
  Input,
  Link,
  Modal,
} from 'vtex.styleguide'

import { useUploadSpreadsheet } from '../hooks/useUploadSpreadSheet'
import { messages } from '../utils'

type Props = {
  onChangeItems: () => void
}

export function UploadSpreadsheetForm({ onChangeItems }: Props) {
  const handles = useCssHandles(['container'] as const)
  const { formatMessage } = useIntl()
  const [file, setFile] = useState<File>()
  const [uploadSpreadsheet, { loading }] = useUploadSpreadsheet()
  const ref = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setFile(undefined)

    if (ref.current) {
      ref.current.value = ''
    }
  }

  const handleUpload = () => {
    if (!file) return

    uploadSpreadsheet({ variables: { file } }).then(() => {
      onChangeItems()
      handleClose()
    })
  }

  return (
    <>
      <ButtonWithIcon
        icon={<IconUpload />}
        variation="tertiary"
        onClick={() => setIsOpen(true)}
      >
        {formatMessage(messages.importSpreadsheetLabel)}
      </ButtonWithIcon>
      <Modal
        isOpen={isOpen}
        container={document.querySelector(`.${handles.container}`)}
        onClose={handleClose}
        size="small"
        title={formatMessage(messages.importSpreadsheetLabel)}
        bottomBar={
          <div className="w-100 flex justify-between flex-wrap">
            <Link href="/_v/checkout-b2b/sample-import-csv.csv" target="_blank">
              {formatMessage(messages.importSpreadsheetSample)}
            </Link>
            <Button
              variation="primary"
              onClick={handleUpload}
              isLoading={loading}
              disabled={!file}
            >
              {formatMessage(messages.importSpreadsheetLabel)}
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center w-100 pb4">
          <Input
            type="file"
            accept=".csv"
            ref={ref}
            helpText={formatMessage(messages.importSpreadsheetSelect)}
            onChange={handleFileChange}
          />
        </div>
      </Modal>
    </>
  )
}
