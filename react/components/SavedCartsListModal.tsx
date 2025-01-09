import React, { useCallback, useMemo } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { Query, SavedCart } from 'ssesandbox04.checkout-b2b'
import { Item } from 'vtex.checkout-graphql'
import type {
  AddToCartMutation,
  AddToCartMutationVariables,
  SetManualPriceMutation,
  SetManualPriceMutationVariables,
} from 'vtex.checkout-resources'
import {
  MutationAddToCart,
  MutationSetManualPrice,
} from 'vtex.checkout-resources'
import { Button, EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SAVED_CARTS from '../graphql/getSavedCarts.graphql'
import {
  useClearCart,
  useOrderFormCustom,
  useToast,
  useUpdatePayment,
} from '../hooks'
import type { CompleteOrderForm, ModalProps } from '../typings'
import { messages } from '../utils'
import { SavedCartsTable } from './SavedCardTable'

type GetSavedCartsQuery = Pick<Query, 'getSavedCarts'>

export function SavedCartsListModal({ open, setOpen }: ModalProps) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending, selectedCart, setSelectedCart } = useCheckoutB2BContext()
  const selectedCartData = JSON.parse(selectedCart?.data ?? '{}')
  const { clearCart, isLoading: loadingClearCart } = useClearCart(false)

  const { data } = useQuery<GetSavedCartsQuery>(GET_SAVED_CARTS, {
    ssr: false,
    fetchPolicy: 'network-only',
    onError({ message }) {
      showToast({ message })
    },
  })

  const [addItemsMutation, { loading: loadingAddItemsToCart }] = useMutation<
    AddToCartMutation,
    AddToCartMutationVariables
  >(MutationAddToCart, {
    onError({ message }) {
      showToast({ message })
    },
    onCompleted({ addToCart }) {
      setOrderForm({
        ...orderForm,
        ...addToCart,
        customData: selectedCartData.customData,
        paymentData: selectedCartData.paymentData,
      } as CompleteOrderForm)
    },
  })

  const [
    setManualPriceMutation,
    { loading: loadingSetManualPrice },
  ] = useMutation<SetManualPriceMutation, SetManualPriceMutationVariables>(
    MutationSetManualPrice,
    {
      onError({ message }) {
        showToast({ message })
      },
      onCompleted({ setManualPrice }) {
        setOrderForm({
          ...orderForm,
          ...setManualPrice,
          customData: selectedCartData.customData,
          paymentData: selectedCartData.paymentData,
        } as CompleteOrderForm)
      },
    }
  )

  const { updatePayment, loading: loadingUpdatePayment } = useUpdatePayment()

  const loadingApplySavedCart = useMemo(
    () =>
      loadingClearCart ||
      loadingAddItemsToCart ||
      loadingSetManualPrice ||
      loadingUpdatePayment,
    [
      loadingAddItemsToCart,
      loadingClearCart,
      loadingSetManualPrice,
      loadingUpdatePayment,
    ]
  )

  const savedCarts = data?.getSavedCarts

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleSelectCart = useCallback(
    (cartId: string) => {
      setSelectedCart(savedCarts?.find((cart: SavedCart) => cart.id === cartId))
    },
    [savedCarts, setSelectedCart]
  )

  const handleConfirm = useCallback(
    (cartId: string) => {
      const cart = savedCarts?.find((c: SavedCart) => c.id === cartId)

      if (!cart) return

      const { items, salesChannel, marketingData, paymentData } = JSON.parse(
        cart.data ?? '{}'
      )

      const { utmipage, ...newMarketingData } = marketingData ?? {}
      const { payments } = paymentData

      setPending(true)

      clearCart(undefined, {
        onSuccess: () => {
          addItemsMutation({
            variables: {
              items: items?.map(
                (item: Item & { assemblies?: unknown }, index: number) => ({
                  id: +item.id,
                  index,
                  quantity: item.quantity,
                  seller: item.seller,
                  uniqueId: item.uniqueId,
                  options: item.assemblies,
                })
              ),
              salesChannel,
              marketingData: marketingData
                ? {
                    ...newMarketingData,
                    ...(utmipage && { utmiPage: utmipage }),
                  }
                : null,
            },
          }).then(async () => {
            let index = 0

            for await (const item of items) {
              if (item.manualPrice) {
                await setManualPriceMutation({
                  variables: {
                    manualPriceInput: {
                      itemIndex: index++,
                      price: item.manualPrice,
                    },
                  },
                })
              }
            }

            if (payments?.[0]) {
              await updatePayment({
                variables: {
                  paymentData: {
                    payments: [
                      {
                        paymentSystem: payments[0].paymentSystem,
                        referenceValue: payments[0].referenceValue,
                        installmentsInterestRate:
                          payments[0].merchantSellerPayments?.[0]
                            ?.interestRate ?? 0,
                        installments: payments[0].installment ?? 1,
                        value: payments[0].value,
                      },
                    ],
                  },
                },
              })
            }

            setPending(false)
            handleCloseModal()
          })
        },
      })
    },
    [
      addItemsMutation,
      clearCart,
      handleCloseModal,
      savedCarts,
      setManualPriceMutation,
      setPending,
      updatePayment,
    ]
  )

  const ActionCellRenderer = ({ rowData }: { rowData: SavedCart }) => (
    <Button
      size="small"
      onClick={() => handleConfirm(rowData.id)}
      isLoading={loadingApplySavedCart}
    >
      {formatMessage(messages.confirm)}
    </Button>
  )

  ActionCellRenderer.displayName = 'ActionCellRenderer'

  return (
    <Modal
      isOpen={open}
      onClose={onclose}
      centered
      size="large"
      title={formatMessage(messages.savedCartsTitle)}
    >
      <div className="mb5 ">
        <SavedCartsTable
          savedCarts={savedCarts}
          handleConfirm={handleConfirm}
          handleSelectCart={handleSelectCart}
          loadingApplySavedCart={loadingApplySavedCart}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={onclose}>{formatMessage(messages.cancel)}</Button>
      </div>
    </Modal>
  )
}
