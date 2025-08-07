import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import RepresentativeBalancesTable from './components/AdminRepresentatives'
import CreateRepresentativeBalance from './components/CreateRepresentativeBalance'

const AdminRepresentativeBalances: FC = () => {
  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="Tabela de Saldos por Representante" />}
        />
      }
    >
      <PageBlock variation="full">
        <RepresentativeBalancesTable />
        <CreateRepresentativeBalance />
      </PageBlock>
    </Layout>
  )
}

export default AdminRepresentativeBalances
