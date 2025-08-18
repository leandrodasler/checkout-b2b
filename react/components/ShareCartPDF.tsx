import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Mutation, MutationShareCartArgs } from 'ssesandbox04.checkout-b2b'
import { B2BUser } from 'vtex.b2b-organizations-graphql'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import {
  Button,
  ButtonWithIcon,
  Dropdown,
  IconExternalLink,
  Input,
  Modal,
} from 'vtex.styleguide'

import MUTATION_SHARE_CART from '../graphql/shareCart.graphql'
import MUTATION_UPLOAD_FILE from '../graphql/uploadFile.graphql'
import { useOrderFormCustom, useOrganization, useToast } from '../hooks'
import { elementToPdfBlob, messages } from '../utils'

type MutationUploadFile = {
  uploadFile: { fileUrl: string }
}

type MutationShareCart = Pick<Mutation, 'shareCart'>

type Props = {
  mainRef: React.RefObject<HTMLDivElement>
}

export function ShareCartPDF({ mainRef }: Props) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const handles = useCssHandles(['container'])
  const { orderForm } = useOrderFormCustom()
  const { organization } = useOrganization()
  const [email, setEmail] = useState('')
  const [organizationUser, setOrganizationUser] = useState<string>()
  const inputRef = useRef<HTMLInputElement>()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { getSettings } = useRuntime()
  const storeSettings = getSettings('vtex.store')
  const { clientProfileData } = orderForm
  const { costCenter, tradeName, name, roleName, users } = organization

  const organizationName = useMemo(() => (tradeName ?? '') || name, [
    name,
    tradeName,
  ])

  const costCenterName = costCenter?.name

  const [uploadFile] = useMutation<MutationUploadFile>(MUTATION_UPLOAD_FILE, {
    onError({ message }) {
      showToast({ message })
    },
  })

  const [shareCart] = useMutation<MutationShareCart, MutationShareCartArgs>(
    MUTATION_SHARE_CART,
    {
      onError({ message }) {
        showToast({ message })
      },
    }
  )

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!clientProfileData) return null

  const { firstName, lastName, email: userEmail } = clientProfileData

  if (!firstName || !userEmail || !organizationName || !costCenterName)
    return null

  const handleOpen = () => {
    setOpen(true)

    mainRef.current?.querySelectorAll('[data-pdf-click]').forEach((element) => {
      if (
        element instanceof HTMLElement &&
        element.hasAttribute('data-pdf-click') &&
        element.querySelector('button')
      ) {
        element.querySelector('button')?.click()
      }
    })
  }

  const handleClose = () => {
    setOpen(false)
    setEmail('')
    setOrganizationUser(undefined)
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

    const fileUrl = data?.uploadFile.fileUrl

    if (!fileUrl) return

    await shareCart({
      variables: {
        email,
        subject: formatMessage(messages.shareCartSubject, {
          storeName: storeSettings.storeName,
        }),
        title: formatMessage(messages.shareCartTitle),
        linkLabel: formatMessage(messages.shareCartLink),
        linkHref: fileUrl,
        sentByLabel: formatMessage(messages.shareCartSentBy),
        userLabel: formatMessage(messages.shareCartUser),
        sentByName: `${firstName}${lastName ? ` ${lastName}` : ''}`,
        sentByEmail: userEmail,
        roleLabel: formatMessage(messages.shareCartRole),
        sentByRole: roleName,
        organizationLabel: formatMessage(messages.companyName),
        sentByOrganization: organizationName,
        costCenterLabel: formatMessage(messages.costCenterSingleLabel),
        sentByCostCenter: costCenterName,
        footerLine1: formatMessage(messages.shareCartRegards),
        footerLine2: storeSettings.storeName,
      },
    })

    handleClose()
    showToast({
      message: formatMessage(messages.shareCartSuccess),
      action: {
        label: formatMessage(messages.shareCartLink),
        href: fileUrl,
        target: '__blank',
      },
    })
  }

  const getUserLabel = (user?: B2BUser | null) => {
    return !user?.name || user?.name === 'null null'
      ? user?.email ?? ''
      : `${user?.name} <${user?.email}>`
  }

  return (
    <>
      <ButtonWithIcon
        icon={<IconExternalLink />}
        variation="tertiary"
        onClick={handleOpen}
      >
        {formatMessage(messages.shareCartButton)}
      </ButtonWithIcon>
      <Modal
        isOpen={open}
        container={document.querySelector(`.${handles.container}`)}
        onClose={handleClose}
        size="small"
        title={formatMessage(messages.shareCartModalTitle)}
        bottomBar={
          <div className="flex justify-end">
            <Button
              variation="primary"
              onClick={handleSharePDF}
              isLoading={loading}
            >
              {formatMessage(messages.shareCartLabel)}
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
            {!!users?.length && (
              <Dropdown
                options={users
                  .sort((a, b) =>
                    getUserLabel(a).localeCompare(getUserLabel(b))
                  )
                  .map((user) => ({
                    label: getUserLabel(user),
                    value: user?.id ?? '',
                  }))}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setOrganizationUser(e.target.value)
                  setEmail(
                    users.find((u) => u?.id === e.target.value)?.email ?? ''
                  )
                }}
                value={organizationUser}
              />
            )}
            <Input
              ref={inputRef}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              size="small"
              label={formatMessage(messages.shareCartEmail)}
              placeholder={formatMessage(messages.shareCartEmailPlaceholder)}
            />
          </form>
        </div>
      </Modal>
    </>
  )
}
