import { ServiceContext } from '@vtex/api'
import type { MutationShareCartArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { cartSharedMessage } from '../../mail-templates/cartShared'

export const shareCart = async (
  _: unknown,
  { email, subject, ...data }: MutationShareCartArgs,
  context: ServiceContext<Clients>
) => {
  const { mail } = context.clients

  await mail.publishTemplate(cartSharedMessage)

  await mail.sendMail({
    templateName: 'checkout-b2b-cart-shared',
    jsonData: { message: { to: email, subject }, data },
  })

  return data.linkHref
}
