import { Service } from '@vtex/api'

import clients from './clients'
import graphql from './resolvers'

export default new Service({ clients, graphql })
