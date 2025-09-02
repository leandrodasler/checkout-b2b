import { ServiceContext } from '@vtex/api'
import { QueryGetRepresentativeBalanceTransactionsArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
  REPRESENTATIVE_BALANCE_TRANSACTION_FIELDS,
  saveSchemas,
  SCHEMA_VERSION,
} from '../../utils'

export const getRepresentativeBalanceTransactions = async (
  _: unknown,
  {
    email,
    page,
    pageSize,
    sort,
  }: QueryGetRepresentativeBalanceTransactionsArgs,
  context: ServiceContext<Clients>
) => {
  await saveSchemas(context)

  const { masterdata } = context.clients

  return masterdata.searchDocuments<RepresentativeBalanceTransaction>({
    dataEntity: REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
    fields: REPRESENTATIVE_BALANCE_TRANSACTION_FIELDS,
    where: `email=${email}`,
    pagination: { page: page ?? 1, pageSize: pageSize ?? 15 },
    schema: SCHEMA_VERSION,
    sort: sort ?? 'createdIn asc',
  })
}
