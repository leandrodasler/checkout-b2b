import { deleteCart } from './mutations/deleteCart'
import { placeOrder } from './mutations/placeOrder'
import { saveCart } from './mutations/saveCart'
import { saveRepresentativeBalance } from './mutations/saveRepresentativeBalance'
import { saveRepresentativeBalanceSettings } from './mutations/saveRepresentativeBalanceSettings'
import { shareCart } from './mutations/shareCart'
import { updatePrices } from './mutations/updatePrices'
import { getAppSettings } from './queries/getAppSettings'
import { getCart } from './queries/getCart'
import { getRepresentativeBalanceByEmail } from './queries/getRepresentativeBalanceByEmail'
import { getRepresentativeBalances } from './queries/getRepresentativeBalances'
import { getRepresentativeBalanceTransactions } from './queries/getRepresentativeBalanceTransactions'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: {
      getSavedCarts,
      getCart,
      getAppSettings,
      getRepresentativeBalances,
      getRepresentativeBalanceByEmail,
      getRepresentativeBalanceTransactions,
    },
    Mutation: {
      saveCart,
      deleteCart,
      placeOrder,
      updatePrices,
      saveRepresentativeBalance,
      saveRepresentativeBalanceSettings,
      shareCart,
    },
  },
}
