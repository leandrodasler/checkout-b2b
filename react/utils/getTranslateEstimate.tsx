import React from 'react'
import { renderToString } from 'react-dom/server'
import { IntlProvider } from 'react-intl'
import { TranslateEstimate } from 'vtex.shipping-estimate-translator'

export function getShippingEstimateTranslated(estimate?: string | null) {
  const { culture, messages } = window.__RUNTIME__

  return renderToString(
    <IntlProvider locale={culture.locale} messages={messages}>
      <TranslateEstimate shippingEstimate={estimate} />
    </IntlProvider>
  )
}
