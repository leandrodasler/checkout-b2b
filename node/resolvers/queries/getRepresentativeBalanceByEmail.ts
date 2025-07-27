import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import {
  getRepresentativeEmail,
  REPRESENTATIVE_BALANCE_ENTITY,
  REPRESENTATIVE_BALANCE_FIELDS,
  saveSchemas,
  SCHEMA_VERSION,
} from '../../utils'
import { getAppSettings } from './getAppSettings'

export const getRepresentativeBalanceByEmail = async (
  _: unknown,
  { email }: { email?: string },
  context: ServiceContext<Clients>
) => {
  await saveSchemas(context)

  const inputEmail = await getRepresentativeEmail(context, email)
  const { masterdata } = context.clients

  let [
    representativeBalance,
  ] = await masterdata.searchDocuments<RepresentativeBalance | null>({
    dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
    fields: REPRESENTATIVE_BALANCE_FIELDS,
    pagination: { page: 1, pageSize: 1 },
    schema: SCHEMA_VERSION,
    where: `email=${inputEmail}`,
  })

  if (!representativeBalance) {
    const settings = await getAppSettings(null, null, context)
    const openingBalance = settings.representativeBalance?.openingBalance ?? 0

    const { DocumentId } = await masterdata.createDocument({
      dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
      fields: {
        email: inputEmail,
        balance: openingBalance,
      },

      schema: SCHEMA_VERSION,
    })

    representativeBalance = await masterdata.getDocument<RepresentativeBalance | null>(
      {
        dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
        fields: REPRESENTATIVE_BALANCE_FIELDS,
        id: DocumentId,
      }
    )
  }

  return representativeBalance
}
