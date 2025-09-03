import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

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
              <span className="c-muted-2 t-body">
                v{process.env.VTEX_APP_VERSION}
              </span>
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
