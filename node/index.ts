import { Service } from '@vtex/api'

import clients from './clients'
import graphql from './resolvers'
import routes from './routes'

export default new Service({ clients, graphql, routes })
