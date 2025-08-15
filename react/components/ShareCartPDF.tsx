import React, { useEffect, useRef, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import { Button, Input, Modal } from 'vtex.styleguide'

import UPLOAD_FILE from '../graphql/uploadFile.graphql'
import { useOrderFormCustom } from '../hooks'
import { elementToPdfBlob } from '../utils'

type MutationUploadFile = {
  uploadFile: { fileUrl: string }
}

type Props = {
  mainRef: React.RefObject<HTMLDivElement>
}

export function ShareCartPDF({ mainRef }: Props) {
  const handles = useCssHandles(['container'])
  const { orderForm } = useOrderFormCustom()
  const [email, setEmail] = useState('')
  const inputRef = useRef<HTMLInputElement>()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [urlFile, setUrlFile] = useState<string>()
  const [uploadFile] = useMutation<MutationUploadFile>(UPLOAD_FILE)

  const handleClose = () => {
    setOpen(false)
    setEmail('')
    setUrlFile(undefined)
    setLoading(false)
  }

  const handleSharePDF = async () => {
    if (!mainRef.current) return

    setLoading(true)

    const pdfBlob = await elementToPdfBlob(mainRef.current)

    const file = new File([pdfBlob], `Cart ${orderForm.orderFormId}.pdf`, {
      type: 'application/pdf',
    })

    const { data } = await uploadFile({ variables: { file } })

    setUrlFile(data?.uploadFile.fileUrl)
    setLoading(false)
  }

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <>
      <Button variation="tertiary" onClick={() => setOpen(true)}>
        Compartilhar PDF
      </Button>
      <Modal
        isOpen={open}
        container={document.querySelector(`.${handles.container}`)}
        onClose={handleClose}
        size="small"
        title="Enviar carrinho no formato PDF"
        bottomBar={
          <div className="flex justify-end">
            <Button
              variation="primary"
              onClick={handleSharePDF}
              isLoading={loading}
            >
              Enviar
            </Button>
          </div>
        }
      >
        <div className="pb7">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSharePDF()
            }}
          >
            <Input
              ref={inputRef}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              size="small"
              label="E-mail"
              placeholder="Insira um e-mail para enviar o carrinho no formato PDF"
            />
          </form>
          {urlFile && (
            <a href={urlFile} target="_blank" rel="noopener noreferrer">
              Baixar PDF
            </a>
          )}
        </div>
      </Modal>
    </>
  )
}
