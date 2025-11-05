import { useQuery } from '@tanstack/react-query'
import { OrderForm } from 'vtex.order-manager'
import { useRuntime } from 'vtex.render-runtime'

import { useCostCenters, useOrganization } from '.'
import { apiRequest } from '../services'
import type { CompleteOrderForm, CompleteOrderFormData } from '../typings'
import { getOrderFormPoNumber, isSameAddress } from '../utils'

const { useOrderForm } = OrderForm

export type UseOrderFormReturn = {
  loading: boolean
  orderForm: CompleteOrderForm
  setOrderForm: (orderForm: CompleteOrderForm) => void
}

type GetRegionSellersResponse = Array<{
  id: string
  sellers: Array<{
    id: string
    name: string
  }>
}>

export function useOrderFormCustom() {
  const { query } = useRuntime()
  const availableCostCenters = useCostCenters()
  const orderFormId = query?.orderFormId ?? ''
  const { organization } = useOrganization()
  const [costCenterAddress] = organization.costCenter?.addresses ?? []

  const { data, isLoading } = useQuery<CompleteOrderFormData, Error>({
    queryKey: [orderFormId],
    queryFn: () =>
      apiRequest<CompleteOrderFormData>(
        `/api/checkout/pub/orderForm/${orderFormId}`,
        'GET'
      ),
  })

  const {
    orderForm,
    loading,
    setOrderForm,
  } = useOrderForm() as UseOrderFormReturn

  const invoiceAddress = data?.invoiceData?.address
  const shippingAddress = orderForm?.shipping?.selectedAddress
  const country = shippingAddress?.country ?? costCenterAddress?.country ?? ''
  const postalCode = shippingAddress?.postalCode?.includes('*')
    ? costCenterAddress?.postalCode ?? ''
    : shippingAddress?.postalCode ?? costCenterAddress?.postalCode ?? ''

  const { data: regionSellersData, isLoading: regionSellersLoading } = useQuery<
    GetRegionSellersResponse,
    Error
  >({
    queryKey: [country, postalCode],
    enabled: !!country && !!postalCode && !postalCode.includes('*'),
    queryFn: () =>
      apiRequest<GetRegionSellersResponse>(
        `/api/checkout/pub/regions?country=${country}&postalCode=${postalCode}`,
        'GET'
      ),
  })

  const isInvoiceSameAsShipping =
    (invoiceAddress?.city ?? '') === (shippingAddress?.city ?? '') &&
    (invoiceAddress?.state ?? '') === (shippingAddress?.state ?? '') &&
    (invoiceAddress?.country ?? '') === (shippingAddress?.country ?? '') &&
    (invoiceAddress?.street ?? '') === (shippingAddress?.street ?? '') &&
    (invoiceAddress?.number ?? '') === (shippingAddress?.number ?? '') &&
    (invoiceAddress?.complement ?? '') ===
      (shippingAddress?.complement ?? '') &&
    (invoiceAddress?.neighborhood ?? '') ===
      (shippingAddress?.neighborhood ?? '') &&
    (invoiceAddress?.postalCode ?? '') === (shippingAddress?.postalCode ?? '')

  const {
    paymentAddress = invoiceAddress && isInvoiceSameAsShipping
      ? shippingAddress
      : invoiceAddress ?? shippingAddress,
  } = orderForm

  const shippingData = orderForm.shippingData ?? data?.shippingData

  return {
    loading: loading || isLoading || regionSellersLoading,
    orderForm: {
      ...data,
      ...orderForm,
      clientProfileData: orderForm.clientProfileData ?? data?.clientProfileData,
      items: orderForm.items.map((item, index) => ({
        ...item,
        sellerChain: item.sellerChain ?? data?.items?.[index]?.sellerChain,
        itemIndex: index,
        costCenter: availableCostCenters?.find((costCenter) =>
          isSameAddress(
            costCenter.address,
            shippingData?.selectedAddresses.find(
              (a) =>
                a?.addressId ===
                shippingData?.logisticsInfo.find((l) => l.itemIndex === index)
                  ?.addressId
            )
          )
        ),
        logisticsInfo: shippingData?.logisticsInfo.find(
          (l) => l.itemIndex === index
        ),
        tax:
          orderForm.items.find((i) => i.uniqueId === item.uniqueId)?.tax ??
          data?.items.find((i) => i.uniqueId === item.uniqueId)?.tax,
        components:
          orderForm?.items.find((i) => i.uniqueId === item.uniqueId)
            ?.components ??
          data?.items.find((i) => i.uniqueId === item.uniqueId)?.components,
      })),
      sellers: [
        ...(orderForm.sellers ?? data?.sellers ?? []),
        ...(regionSellersData?.[0]?.sellers ?? []),
      ],
      paymentAddress,
      poNumber: getOrderFormPoNumber(orderForm.customData),
    },
    setOrderForm,
  }
}
