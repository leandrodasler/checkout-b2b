import { saveCart } from './mutations/saveCart'
import { getAppSettings } from './queries/getAppSettings'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: { getSavedCarts, getAppSettings },
    Mutation: { saveCart },
  },
}
