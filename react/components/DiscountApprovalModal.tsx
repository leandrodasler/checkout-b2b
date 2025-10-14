import React, { useCallback, useRef } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import {
  Mutation,
  MutationUpdateSavedCartStatusArgs,
  Query,
  SavedCart,
  SavedCartStatus,
} from 'ssesandbox04.checkout-b2b'
import { EXPERIMENTAL_Modal as Modal, Spinner } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_ALL_SAVED_CARTS from '../graphql/getAllSavedCarts.graphql'
import UPDATE_SAVED_CART_STATUS from '../graphql/updateSavedCartStatus.graphql'
import { useToast } from '../hooks'
import { messages } from '../utils'
import { DiscountApprovalKanban } from './DiscountApprovalKanban'

type QueryGetAllSavedCarts = Pick<Query, 'getSavedCarts'>
type MutationUpdateSavedCartStatus = Pick<Mutation, 'updateSavedCartStatus'>

type Props = {
  open: boolean
  setOpen: (value: boolean) => void
}

export function DiscountApprovalModal({ open, setOpen }: Props) {
  const { formatMessage } = useIntl()
  const showToast = useToast()
  const { refetchCurrentSavedCart } = useCheckoutB2BContext()

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const { data, loading } = useQuery<QueryGetAllSavedCarts>(
    GET_ALL_SAVED_CARTS,
    {
      ssr: false,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      onError: showToast,
    }
  )

  const lastUpdateCartStatusData = useRef<SavedCart[]>()

  const [
    updateSavedCartStatus,
    { data: updateStatusData, loading: updateCartStatusLoading },
  ] = useMutation<
    MutationUpdateSavedCartStatus,
    MutationUpdateSavedCartStatusArgs
  >(UPDATE_SAVED_CART_STATUS, {
    notifyOnNetworkStatusChange: true,
    onError: showToast,
    onCompleted(completedData) {
      lastUpdateCartStatusData.current = completedData.updateSavedCartStatus
      refetchCurrentSavedCart()
    },
  })

  const handleCartStatus = (id: string, status: SavedCartStatus) => {
    updateSavedCartStatus({ variables: { id, status } })
  }

  const carts =
    updateStatusData?.updateSavedCartStatus ??
    lastUpdateCartStatusData.current ??
    data?.getSavedCarts ??
    []

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      centered
      title={formatMessage(messages.discountKanbanModal)}
      showBottomBarBorder={false}
      size="extralarge"
      style={{ minHeight: '50vh' }}
    >
      {!loading ? (
        <DiscountApprovalKanban
          requests={carts}
          onChangeCartStatus={handleCartStatus}
          isLoadingChangeCartStatus={updateCartStatusLoading}
        />
      ) : (
        <div
          className="flex justify-center items-center"
          style={{ minHeight: '50vh' }}
        >
          <Spinner />
        </div>
      )}
    </Modal>
  )
}
