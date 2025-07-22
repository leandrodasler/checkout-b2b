import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import {
  getRepresentativeEmail,
  REPRESENTATIVE_BALANCE_ENTITY,
  REPRESENTATIVE_BALANCE_FIELDS,
  saveSchemas,
  SCHEMA_VERSION,
} from '../../utils'
import { getRepresentativeBalanceByEmail } from '../queries/getRepresentativeBalanceByEmail'

export const saveRepresentativeBalance = async (
  _: unknown,
  { email, balance }: { email?: string; balance: number },
  context: ServiceContext<Clients>
) => {
  await saveSchemas(context)

  const inputEmail = await getRepresentativeEmail(context, email)

  const { masterdata } = context.clients

  const representativeBalance = await getRepresentativeBalanceByEmail(
    null,
    { email: inputEmail },
    context
  )

  const { DocumentId } = await masterdata.createOrUpdateEntireDocument({
    dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
    fields: { email: inputEmail, balance },
    schema: SCHEMA_VERSION,
    id: representativeBalance?.id,
  })

  const updatedRepresentativeBalance = await masterdata.getDocument({
    dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
    fields: REPRESENTATIVE_BALANCE_FIELDS,
    id: DocumentId,
  })

  return updatedRepresentativeBalance
}
