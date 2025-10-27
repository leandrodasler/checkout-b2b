import { ServiceContext } from '@vtex/api'
import { QueryGetCartCommentsArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getAllCartComments } from '../../utils'

export const getCartComments = async (
  _: unknown,
  { savedCartId }: QueryGetCartCommentsArgs,
  context: ServiceContext<Clients>
) => {
  return getAllCartComments({
    context,
    where: `savedCartId=${savedCartId}`,
    sort: `createdIn DESC`,
  })
}
