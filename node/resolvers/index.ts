import { deleteCart } from './mutations/deleteCart'
import { placeOrder } from './mutations/placeOrder'
import { saveCart } from './mutations/saveCart'
import { saveRepresentativeBalance } from './mutations/saveRepresentativeBalance'
import { saveRepresentativeBalanceSettings } from './mutations/saveRepresentativeBalanceSettings'
import { updatePrices } from './mutations/updatePrices'
import { getAppSettings } from './queries/getAppSettings'
import { getCart } from './queries/getCart'
import { getRepresentativeBalanceByEmail } from './queries/getRepresentativeBalanceByEmail'
import { getRepresentativeBalances } from './queries/getRepresentativeBalances'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: {
      getSavedCarts,
      getCart,
      getAppSettings,
      getRepresentativeBalances,
      getRepresentativeBalanceByEmail,
    },
    Mutation: {
      saveCart,
      deleteCart,
      placeOrder,
      updatePrices,
      saveRepresentativeBalance,
      saveRepresentativeBalanceSettings,
    },
  },
}
