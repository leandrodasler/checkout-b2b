import { deleteCart } from './mutations/deleteCart'
import { saveCart } from './mutations/saveCart'
import { getAppSettings } from './queries/getAppSettings'
import { getCart } from './queries/getCart'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: { getSavedCarts, getCart, getAppSettings },
    Mutation: { saveCart, deleteCart },
  },
}
