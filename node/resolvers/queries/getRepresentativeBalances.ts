import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import {
  REPRESENTATIVE_BALANCE_ENTITY,
  REPRESENTATIVE_BALANCE_FIELDS,
  SCHEMA_VERSION,
} from '../../utils'

export const getRepresentativeBalances = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  const { masterdata } = context.clients

  return masterdata.searchDocuments<RepresentativeBalance>({
    dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
    fields: REPRESENTATIVE_BALANCE_FIELDS,
    pagination: { page: 1, pageSize: 100 },
    schema: SCHEMA_VERSION,
    sort: 'email ASC',
  })
}
