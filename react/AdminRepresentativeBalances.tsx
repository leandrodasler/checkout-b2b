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
          title={<FormattedMessage id="admin/representativebalances.title" />}
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
