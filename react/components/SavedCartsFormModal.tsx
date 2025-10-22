import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import { Button, Input, Modal } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { useSaveCart, useUpdateSavedCartTitle } from '../hooks'
import type { ModalProps } from '../typings'
import { messages } from '../utils'

type Props = ModalProps & { isRenamingCart?: boolean }

export function SavedCartsFormModal({ open, setOpen, isRenamingCart }: Props) {
  const { locale } = useRuntime().culture
  const handles = useCssHandles(['container'])
  const { formatMessage } = useIntl()
  const { selectedCart } = useCheckoutB2BContext()
  const inputRef = useRef<HTMLInputElement>()
  const [inputTitle, setInputTitle] = useState(
    isRenamingCart ? selectedCart?.title ?? '' : ''
  )

  const title =
    inputTitle.trim() ||
    formatMessage(messages.savedCartsSaveDefaultTitle, {
      date: new Date().toLocaleString(locale),
    })

  const { handleSaveCart, loading: saveLoading } = useSaveCart({
    setOpen,
    isCurrent: false,
    title,
  })

  const {
    handleUpdateSavedCartTitle,
    loading: renameLoading,
  } = useUpdateSavedCartTitle({
    id: selectedCart?.id,
    title,
    onCompleted: () => setOpen(false),
  })

  const loading = saveLoading || renameLoading
  const handleSaveCartAction = isRenamingCart
    ? handleUpdateSavedCartTitle
    : handleSaveCart

  useEffect(() => inputRef.current?.focus(), [])

  return (
    <Modal
      isOpen={open}
      container={document.querySelector(`.${handles.container}`)}
      onClose={() => setOpen(false)}
      size="small"
      title={
        isRenamingCart
          ? formatMessage(messages.savedCartsRename)
          : formatMessage(messages.savedCartsSaveNew)
      }
      bottomBar={
        <div className="flex justify-end">
          <Button
            variation="primary"
            disabled={loading}
            isLoading={loading}
            onClick={handleSaveCartAction}
          >
            {formatMessage(messages.confirm)}
          </Button>
        </div>
      }
    >
      <div className="pb7">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveCartAction()
          }}
        >
          <Input
            ref={inputRef}
            value={inputTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputTitle(e.target.value)
            }
            size="small"
            disabled={loading}
            label={formatMessage(messages.savedCartsSaveTitle)}
            placeholder={formatMessage(messages.savedCartsSavePlaceholder)}
          />
        </form>
      </div>
    </Modal>
  )
}
