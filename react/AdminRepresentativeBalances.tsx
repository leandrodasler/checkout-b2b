import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import { RepresentativeBalanceSettings } from './components/representative-balance/RepresentativeBalanceSettings'
import RepresentativeBalancesTable from './components/representative-balance/RepresentativesBalancesTable'

const AdminRepresentativeBalances: FC = () => {
  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={
            <span className="flex flex-wrap flex-nowrap-l justify-between">
              <span>
                <FormattedMessage id="admin/checkout-b2b.title" />
                <br />
                <span className="t-heading-3 c-muted-1">
                  <FormattedMessage id="admin/representativebalances.title" />
                </span>
              </span>
              <div className="mt4 mt0-l">
                <RepresentativeBalanceSettings />
              </div>
            </span>
          }
        />
      }
    >
      <PageBlock variation="full">
        <RepresentativeBalancesTable />
      </PageBlock>
    </Layout>
  )
}

export default AdminRepresentativeBalances
