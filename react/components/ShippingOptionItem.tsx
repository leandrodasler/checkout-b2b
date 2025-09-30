import React from 'react'

import { useUpdateShippingOption } from '../hooks'
import { CustomItem } from '../typings'
import { SlaDropdown } from './SlaDrodown'

type Props = { item: CustomItem; disabled?: boolean }

export function ShippingOptionItem({ item, disabled }: Props) {
  const { logisticsInfo } = item
  const [updateShippingOption, { loading }] = useUpdateShippingOption()

  if (!logisticsInfo?.slas?.length) return <>N/A</>

  const options = logisticsInfo.slas
    .filter((sla) => sla?.deliveryChannel === 'delivery')
    .map((sla) => ({
      label: sla?.name ?? '',
      value: sla?.id,
    }))

  const selectedSla = logisticsInfo.slas.find(
    (sla) => sla?.id === logisticsInfo.selectedSla
  )

  const handleChangeItemShippingOption = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateShippingOption({
      variables: { itemIndexes: [item.itemIndex], selectedSla: e.target.value },
    })
  }

  return (
    <SlaDropdown
      disabled={disabled}
      isLoading={loading}
      options={options}
      selectedSla={selectedSla}
      onChange={handleChangeItemShippingOption}
      variation="inline"
      showEstimateDate={false}
    />
  )
}
