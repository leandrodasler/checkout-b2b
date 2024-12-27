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
import { Button, Dropdown, Modal } from 'vtex.styleguide'

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
import { TotalizerSpinner } from './TotalizerSpinner'

type GetSavedCartsQuery = Pick<Query, 'getSavedCarts'>

export function SavedCartsListModal({ open, setOpen }: ModalProps) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending, selectedCart, setSelectedCart } = useCheckoutB2BContext()
  const selectedCartData = JSON.parse(selectedCart?.data ?? '{}')
  const { clearCart, isLoading: loadingClearCart } = useClearCart(false)

  const { data, loading: loadingGetSavedCarts } = useQuery<GetSavedCartsQuery>(
    GET_SAVED_CARTS,
    {
      ssr: false,
      fetchPolicy: 'network-only',
      onError({ message }) {
        showToast({ message })
      },
    }
  )

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

  const options = useMemo(
    () =>
      savedCarts?.map((cart: SavedCart) => ({
        label: `${new Date(cart.createdIn).toLocaleString()} - ${cart.title}`,
        value: cart.id,
      })),
    [savedCarts]
  )

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCart(
        savedCarts?.find((cart: SavedCart) => cart.id === e.target.value)
      )
    },
    [savedCarts, setSelectedCart]
  )

  const handleConfirm = useCallback(() => {
    const { items, salesChannel, marketingData, paymentData } = selectedCartData
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
                        payments[0].merchantSellerPayments?.[0]?.interestRate ??
                        0,
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
  }, [
    addItemsMutation,
    clearCart,
    handleCloseModal,
    selectedCartData,
    setManualPriceMutation,
    setPending,
    updatePayment,
  ])

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      size="small"
      title={formatMessage(messages.savedCartsUseLabel)}
      bottomBar={
        !loadingGetSavedCarts &&
        !!savedCarts?.length && (
          <div className="flex flex-wrap items-center justify-around justify-between-ns w-100">
            <Button
              variation="tertiary"
              onClick={handleCloseModal}
              disabled={loadingApplySavedCart}
            >
              {formatMessage(messages.cancel)}
            </Button>
            <Button
              variation="primary"
              onClick={handleConfirm}
              isLoading={loadingApplySavedCart}
            >
              {formatMessage(messages.confirm)}
            </Button>
          </div>
        )
      }
    >
      <div className="pb7">
        {loadingGetSavedCarts && <TotalizerSpinner />}

        {!loadingGetSavedCarts &&
          !savedCarts?.length &&
          formatMessage(messages.savedCartsUseEmpty)}

        {!loadingGetSavedCarts && !!savedCarts?.length && (
          <Dropdown
            size="small"
            placeholder={formatMessage(messages.savedCartsSelectLabel)}
            options={options}
            value={selectedCart?.id}
            onChange={handleChange}
          />
        )}
      </div>
    </Modal>
  )
}
