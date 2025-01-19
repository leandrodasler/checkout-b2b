import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { Button, Input, Modal } from 'vtex.styleguide'

import { useSaveCart } from '../hooks'
import type { ModalProps } from '../typings'
import { messages } from '../utils'

type Props = ModalProps

export function SavedCartsFormModal({ open, setOpen }: Props) {
  const handles = useCssHandles(['container'])
  const { formatMessage } = useIntl()
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>()

  const { handleSaveCart, loading } = useSaveCart({
    setOpen,
    isCurrent: false,
    cartTitle: title,
  })

  useEffect(() => inputRef.current?.focus(), [])

  return (
    <Modal
      isOpen={open}
      container={document.querySelector(`.${handles.container}`)}
      onClose={() => setOpen(false)}
      size="small"
      title={formatMessage(messages.savedCartsSaveNew)}
      bottomBar={
        <div className="flex justify-end">
          <Button
            variation="primary"
            disabled={loading}
            isLoading={loading}
            onClick={handleSaveCart}
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
            handleSaveCart()
          }}
        >
          <Input
            ref={inputRef}
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
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
