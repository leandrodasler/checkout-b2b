import { ServiceContext } from '@vtex/api'
import { QueryGetRepresentativeBalanceTransactionsArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
  REPRESENTATIVE_BALANCE_TRANSACTION_FIELDS,
  SCHEMA_VERSION,
} from '../../utils'

export const getRepresentativeBalanceTransactions = async (
  _: unknown,
  args: QueryGetRepresentativeBalanceTransactionsArgs,
  context: ServiceContext<Clients>
) => {
  const { masterdata } = context.clients

  const { email, page = 1, pageSize = 20, sort = 'createdIn DESC' } = args

  const response = await masterdata.searchDocumentsWithPaginationInfo<RepresentativeBalanceTransactionResponse>(
    {
      dataEntity: REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
      fields: REPRESENTATIVE_BALANCE_TRANSACTION_FIELDS,
      schema: SCHEMA_VERSION,
      where: `email="${email}"`,
      pagination: { page: page ?? 1, pageSize: pageSize ?? 15 },
      sort: sort ?? 'createdIn asc',
    }
  )

  return response
}
