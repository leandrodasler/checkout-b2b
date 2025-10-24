import { useMemo } from 'react'
import { ExecutionResult, useMutation } from 'react-apollo'
import type {
  Mutation,
  MutationUpdatePricesArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'
import { CustomData, Item } from 'vtex.checkout-graphql'
import type {
  SelectDeliveryOptionMutation,
  SelectDeliveryOptionMutationVariables,
} from 'vtex.checkout-resources'
import { MutationSelectDeliveryOption } from 'vtex.checkout-resources'
import { useRuntime } from 'vtex.render-runtime'
import type {
  LogisticsInfo,
  Mutation as MutationCheckout,
  MutationSetOrderFormCustomDataArgs,
} from 'vtex.store-graphql'

import { useAddItems, useClearCart, useUpdatePayment } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import SET_ORDER_FORM_CUSTOM_DATA from '../graphql/setOrderFormCustomData.graphql'
import MUTATION_UPDATE_PRICES from '../graphql/updatePrices.graphql'
import type { CompleteOrderForm } from '../typings'
import { CHECKOUT_B2B_CUSTOM_APP_ID } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useToast } from './useToast'

type MutationSetOrderFormCustomData = Pick<
  MutationCheckout,
  'setOrderFormCustomData'
>

type MutationUpdatePrices = Pick<Mutation, 'updatePrices'>

type Props = {
  onChangeItems?: () => void
}

export function useSavedCart(props?: Props) {
  const showToast = useToast()
  const { page, navigate, query } = useRuntime()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const {
    useCartLoading,
    setUseCartLoading,
    selectedCart,
    setSelectedCart,
  } = useCheckoutB2BContext()

  const selectedCartData = JSON.parse(selectedCart?.data ?? '{}')
  const { clearCart, isLoading: loadingClearCart } = useClearCart({
    updateOrderForm: false,
    onChangeItems: props?.onChangeItems,
  })

  const [addItemsMutation, { loading: loadingAddItemsToCart }] = useAddItems({
    completeData: {
      paymentData: selectedCartData.paymentData,
      sellers: selectedCartData.sellers,
    },
  })

  const [
    setManualPriceMutation,
    { loading: loadingSetManualPrice },
  ] = useMutation<MutationUpdatePrices, MutationUpdatePricesArgs>(
    MUTATION_UPDATE_PRICES,
    {
      onCompleted: ({ updatePrices }) => {
        setOrderForm({
          ...orderForm,
          ...updatePrices,
          paymentData: selectedCartData.paymentData,
        } as CompleteOrderForm)
      },
      onError: showToast,
    }
  )

  const [selectDeliveryOption] = useMutation<
    SelectDeliveryOptionMutation,
    SelectDeliveryOptionMutationVariables
  >(MutationSelectDeliveryOption, {
    onCompleted({ selectDeliveryOption: updatedOrderForm }) {
      setOrderForm({
        ...orderForm,
        ...updatedOrderForm,
        paymentData: selectedCartData.paymentData,
      } as CompleteOrderForm)
    },
    onError: showToast,
  })

  const { updatePayment, loading: loadingUpdatePayment } = useUpdatePayment()

  const [setOrderFormCustomData] = useMutation<
    MutationSetOrderFormCustomData,
    MutationSetOrderFormCustomDataArgs
  >(SET_ORDER_FORM_CUSTOM_DATA, {
    onCompleted(customDataMutation) {
      setOrderForm({
        ...orderForm,
        ...customDataMutation.setOrderFormCustomData,
        paymentData: selectedCartData.paymentData,
      } as CompleteOrderForm)
    },
  })

  const loading = useMemo(
    () =>
      useCartLoading ||
      loadingClearCart ||
      loadingAddItemsToCart ||
      loadingSetManualPrice ||
      loadingUpdatePayment,
    [
      useCartLoading,
      loadingAddItemsToCart,
      loadingClearCart,
      loadingSetManualPrice,
      loadingUpdatePayment,
    ]
  )

  const handleUseSavedCart = async (cart: SavedCart) => {
    setSelectedCart(cart)

    const { items, paymentData, shippingData, customData } = JSON.parse(
      cart.data ?? '{}'
    )

    const { payments } = paymentData
    const { logisticsInfo } = shippingData ?? {}
    const selectedDeliveryOption = (logisticsInfo as LogisticsInfo[]).find(
      (logisticsInfoItem) => !!logisticsInfoItem.selectedSla
    )?.selectedSla

    setUseCartLoading(true)

    try {
      await clearCart()
      await addItemsMutation({
        variables: {
          orderItems: items?.map((item: Item) => ({
            id: +item.id,
            quantity: item.quantity,
            seller: item.seller,
          })),
        },
      })

      if (payments?.[0]) {
        await updatePayment({
          variables: {
            paymentData: {
              payments: [
                {
                  paymentSystem: payments[0].paymentSystem,
                  referenceValue: payments[0].referenceValue,
                  installmentsInterestRate:
                    payments[0].merchantSellerPayments?.[0]?.interestRate ?? 0,
                  installments: payments[0].installment ?? 1,
                  value: payments[0].value,
                },
              ],
            },
          },
        })
      }

      if (selectedDeliveryOption) {
        await selectDeliveryOption({
          variables: {
            deliveryOptionId: selectedDeliveryOption,
          },
        })
      }

      await setOrderFormCustomData({
        variables: {
          appId: CHECKOUT_B2B_CUSTOM_APP_ID,
          field: 'savedCart',
          value: cart.id,
        },
      })

      if (customData?.customApps?.length) {
        const { customApps } = customData as {
          customApps: NonNullable<CustomData>['customApps']
        }

        const setCustomDataPromises: Array<
          Promise<ExecutionResult<MutationSetOrderFormCustomData>>
        > = []

        customApps.forEach((app) => {
          Object.entries(app.fields).forEach(([field, value]) => {
            if (
              app.id === CHECKOUT_B2B_CUSTOM_APP_ID &&
              field === 'savedCart'
            ) {
              return
            }

            setCustomDataPromises.push(
              setOrderFormCustomData({
                variables: {
                  appId: app.id,
                  field,
                  value: value as string,
                },
              })
            )
          })
        })

        await Promise.all(setCustomDataPromises)
      }

      const manualPriceItems = items
        ?.map((item: Item, index: number) => {
          if (item.manualPrice) {
            return {
              index,
              price: item.manualPrice ?? item.sellingPrice ?? 0,
            }
          }

          return null
        })
        .filter(Boolean)

      if (manualPriceItems?.length) {
        await setManualPriceMutation({
          variables: { items: manualPriceItems },
        })
      }

      setUseCartLoading(false)

      if (page !== 'store.checkout-b2b') {
        navigate({
          page: 'store.checkout-b2b',
          fallbackToWindowLocation: true,
          query: new URLSearchParams(query).toString(),
        })
      }
    } catch (error) {
      setUseCartLoading(false)
      showToast({ message: error.message })
    }
  }

  return { handleUseSavedCart, loading }
}
