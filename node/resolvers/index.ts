import { deleteCart } from './mutations/deleteCart'
import { placeOrder } from './mutations/placeOrder'
import { saveCart } from './mutations/saveCart'
import { updatePrices } from './mutations/updatePrices'
import { getAppSettings } from './queries/getAppSettings'
import { getCart } from './queries/getCart'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: { getSavedCarts, getCart, getAppSettings },
    Mutation: { saveCart, deleteCart, placeOrder, updatePrices },
  },
}
