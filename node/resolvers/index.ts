import * as schemaDirectives from './directives'
import { addAddressToCart } from './mutations/addAddressToCart'
import { addItemsToCart } from './mutations/addItemsToCart'
import { clearCart } from './mutations/clearCart'
import { createCartComment } from './mutations/createCartComment'
import { deleteCart } from './mutations/deleteCart'
import { placeOrder } from './mutations/placeOrder'
import { saveCart } from './mutations/saveCart'
import { saveRepresentativeBalance } from './mutations/saveRepresentativeBalance'
import { saveRepresentativeBalanceSettings } from './mutations/saveRepresentativeBalanceSettings'
import { shareCart } from './mutations/shareCart'
import { updateItemsQuantity } from './mutations/updateItemsQuantity'
import { updateMultipleShippingOptions } from './mutations/updateMultipleShippingOptions'
import { updatePrices } from './mutations/updatePrices'
import { updateSavedCartStatus } from './mutations/updateSavedCartStatus'
import { updateSavedCartTitle } from './mutations/updateSavedCartTitle'
import { updateShippingOption } from './mutations/updateShippingOption'
import { uploadSpreadsheet } from './mutations/uploadSpreadsheet'
import { checkOrderFormConfiguration } from './queries/checkOrderFormConfiguration'
import { getAppSettings } from './queries/getAppSettings'
import { getCart } from './queries/getCart'
import { getCartComments } from './queries/getCartComments'
import { getRepresentativeBalanceByEmail } from './queries/getRepresentativeBalanceByEmail'
import { getRepresentativeBalances } from './queries/getRepresentativeBalances'
import { getRepresentativeBalanceTransactions } from './queries/getRepresentativeBalanceTransactions'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: {
      checkOrderFormConfiguration,
      getSavedCarts,
      getCart,
      getAppSettings,
      getRepresentativeBalances,
      getRepresentativeBalanceByEmail,
      getRepresentativeBalanceTransactions,
      getCartComments,
    },
    Mutation: {
      clearCart,
      saveCart,
      updateSavedCartStatus,
      updateSavedCartTitle,
      deleteCart,
      placeOrder,
      updatePrices,
      saveRepresentativeBalance,
      saveRepresentativeBalanceSettings,
      shareCart,
      uploadSpreadsheet,
      addItemsToCart,
      updateItemsQuantity,
      addAddressToCart,
      updateShippingOption,
      updateMultipleShippingOptions,
      createCartComment,
    },
  },
  schemaDirectives,
}
