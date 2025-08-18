import { readFile } from '../utils'

const MESSAGE_BODY = readFile('../mail-templates/cartShared.html')

export const cartSharedMessage = {
  FriendlyName: 'Cart Shared (by Checkout B2B)',
  IsDefaultTemplate: false,
  IsPersisted: true,
  IsRemoved: false,
  Name: 'checkout-b2b-cart-shared',
  Templates: {
    email: {
      IsActive: true,
      Message: MESSAGE_BODY,
      ProviderId: '00000000-0000-0000-0000-000000000000',
      Subject: '{{message.subject}}',
      To: '{{message.to}}',
      Type: 'E',
      withError: false,
    },
    sms: {
      IsActive: false,
      Parameters: [],
      Type: 'S',
      withError: false,
    },
  },
  Type: '',
}
