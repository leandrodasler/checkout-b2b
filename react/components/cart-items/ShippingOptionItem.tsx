import React from 'react'

import { useUpdateShippingOption } from '../../hooks'
import { CustomItem } from '../../typings'
import { getShippingEstimateTranslated } from '../../utils/getTranslateEstimate'
import { TruncatedText } from '../common/TruncatedText'
import { SlaDropdown } from '../delivery/SlaDrodown'

type Props = { item: CustomItem; disabled?: boolean }

export function ShippingOptionItem({ item, disabled }: Props) {
  const { logisticsInfo } = item
  const [updateShippingOption, { loading }] = useUpdateShippingOption()

  const options = logisticsInfo?.slas?.map((sla) => ({
    label: `${sla?.name ?? ''} - ${getShippingEstimateTranslated(
      sla?.shippingEstimate
    )}`,
    value: sla?.id,
  }))

  const selectedSla = logisticsInfo?.slas?.find(
    (sla) => sla?.id === logisticsInfo.selectedSla
  )

  const handleChangeItemShippingOption = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateShippingOption({
      variables: { itemIndexes: [item.itemIndex], selectedSla: e.target.value },
    })
  }

  if (!options) {
    return <div className={disabled ? 'strike' : ''}>N/A</div>
  }

  return (
    <TruncatedText
      strike={disabled}
      label={
        loading ? null : (
          <>
            <span className="b">{selectedSla?.name}</span>
            <br />
            {getShippingEstimateTranslated(selectedSla?.shippingEstimate)}
          </>
        )
      }
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
