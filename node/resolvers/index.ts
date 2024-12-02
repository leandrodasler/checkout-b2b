import { saveCart } from './mutations/saveCart'
import { getSavedCarts } from './queries/getSavedCarts'

export default {
  resolvers: {
    Query: { getSavedCarts },
    Mutation: { saveCart },
  },
}
