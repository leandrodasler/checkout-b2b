import React from 'react'

import { useUpdateShippingOption } from '../../hooks'
import { CustomItem } from '../../typings'
import { TruncatedText } from '../common/TruncatedText'
import { SlaDropdown } from '../delivery/SlaDrodown'

type Props = { item: CustomItem; disabled?: boolean }

export function ShippingOptionItem({ item, disabled }: Props) {
  const { logisticsInfo } = item
  const [updateShippingOption, { loading }] = useUpdateShippingOption()

  if (!logisticsInfo?.slas?.length)
    return <div className={disabled ? 'strike' : ''}>N/A</div>

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
      variables: { itemIndexes: [item.itemIndex], selectedSla: e.target.value },
    })
  }

  return (
    <TruncatedText
      strike={disabled}
      label={loading ? null : selectedSla?.name}
      text={
        <SlaDropdown
          disabled={disabled}
          isLoading={loading}
          options={options}
          selectedSla={selectedSla}
          onChange={handleChangeItemShippingOption}
          variation="inline"
          showEstimateDate={false}
        />
      }
    />
  )
}
