import { NotFoundError, ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import {
  getRepresentativeEmail,
  REPRESENTATIVE_BALANCE_ENTITY,
  REPRESENTATIVE_BALANCE_FIELDS,
  REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
  saveSchemas,
  SCHEMA_VERSION,
} from '../../utils'
import { getRepresentativeBalanceByEmail } from '../queries/getRepresentativeBalanceByEmail'

export const saveRepresentativeBalance = async (
  _: unknown,
  {
    email,
    balance,
    orderGroup,
    overwrite,
  }: {
    email?: string
    balance: number
    orderGroup: string
    overwrite?: boolean
  },
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

  const oldBalance = representativeBalance?.balance ?? 0
  const newBalance = overwrite ? balance : oldBalance + balance
  let representativeBalanceId = representativeBalance?.id

  if (typeof balance === 'number') {
    const { DocumentId } = await masterdata.createOrUpdateEntireDocument({
      dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
      fields: {
        email: inputEmail,
        balance: newBalance,
      },
      schema: SCHEMA_VERSION,
      id: representativeBalance?.id,
    })

    representativeBalanceId = DocumentId
  }

  if (!representativeBalanceId) {
    throw new NotFoundError('representative-balance-not-found')
  }

  await masterdata.createDocument({
    dataEntity: REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
    fields: {
      email: inputEmail,
      oldBalance,
      newBalance,
      orderGroup,
    },
    schema: SCHEMA_VERSION,
    ...(representativeBalanceId !== inputEmail && {
      id: representativeBalanceId,
    }),
  })

  const updatedRepresentativeBalance = await masterdata.getDocument<RepresentativeBalance | null>(
    {
      dataEntity: REPRESENTATIVE_BALANCE_ENTITY,
      fields: REPRESENTATIVE_BALANCE_FIELDS,
      id: representativeBalanceId,
    }
  )

  return updatedRepresentativeBalance
}
