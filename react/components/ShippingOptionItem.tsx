import React from 'react'

import { useUpdateShippingOption } from '../hooks'
import { CustomItem } from '../typings'
import { SlaDropdown } from './SlaDrodown'

type Props = { item: CustomItem }

export function ShippingOptionItem({ item }: Props) {
  const { logisticsInfo } = item
  const [updateShippingOption, { loading }] = useUpdateShippingOption()

  if (!logisticsInfo?.slas?.length) return <>N/A</>

  const options = logisticsInfo.slas.map((sla) => ({
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
      variables: { itemIndex: item.itemIndex, selectedSla: e.target.value },
    })
  }

  return (
    <SlaDropdown
      isLoading={loading}
      options={options}
      selectedSla={selectedSla}
      onChange={handleChangeItemShippingOption}
      variation="inline"
      showEstimateDate={false}
    />
  )
}
