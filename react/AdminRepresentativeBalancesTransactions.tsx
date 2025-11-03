import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import RepresentativeBalanceTransactions from './components/representative-balance/RepresentativeBalanceTransactions'

type Props = {
  params: {
    email: string
  }
}

const AdminRepresentativeBalancesTransactions: FC<Props> = ({ params }) => {
  const { email } = params

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={
            <span className="flex justify-between">
              <span>
                <FormattedMessage id="admin/checkout-b2b.title" /> |{' '}
                <FormattedMessage id="admin/representativebalances.title" /> |{' '}
                <FormattedMessage id="admin/representativebalances.transactions.title" />
              </span>
            </span>
          }
        />
      }
    >
      <PageBlock variation="full">
        <RepresentativeBalanceTransactions email={email} />
      </PageBlock>
    </Layout>
  )
}

export default AdminRepresentativeBalancesTransactions
