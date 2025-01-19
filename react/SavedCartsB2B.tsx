import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useIntl } from 'react-intl'
import 'vtex.country-codes/locales'
import { useCssHandles } from 'vtex.css-handles'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Layout, PageBlock, PageHeader, ToastProvider } from 'vtex.styleguide'

import {
  CheckoutB2BProvider,
  useCheckoutB2BContext,
} from './CheckoutB2BContext'
import { CheckoutB2bTable } from './components/CheckoutB2bTable'
import { SavedCartsTable } from './components/SavedCartsTable'
import { queryClient } from './services'
import './styles.css'
import { messages } from './utils'

function SavedCartB2B() {
  const handles = useCssHandles(['container', 'table'])
  const { selectedCart } = useCheckoutB2BContext()
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()

  return (
    <div className={handles.container}>
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={<ExtensionPoint id="rich-text" />}
            linkLabel={formatMessage(messages.backToHome)}
            onLinkClick={() =>
              navigate({ page: 'store.home', fallbackToWindowLocation: true })
            }
          />
        }
      >
        <PageBlock title={formatMessage(messages.savedCards)}>
          <div className={handles.table}>
            <SavedCartsTable />
          </div>
        </PageBlock>
        {selectedCart ?? <CheckoutB2bTable />}
      </Layout>
    </div>
  )
}

function CheckoutB2BWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider positioning="window">
        <CheckoutB2BProvider>
          <SavedCartB2B />
        </CheckoutB2BProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default CheckoutB2BWrapper
