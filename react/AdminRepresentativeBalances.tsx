import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import { RepresentativeBalanceSettings } from './components/RepresentativeBalanceSettings'
import RepresentativeBalancesTable from './components/RepresentativesBalancesTable'

const AdminRepresentativeBalances: FC = () => {
  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={
            <span className="flex justify-between">
              <span>
                <FormattedMessage id="admin/checkout-b2b.title" /> |{' '}
                <FormattedMessage id="admin/representativebalances.title" />
              </span>
              <RepresentativeBalanceSettings />
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
