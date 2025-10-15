import { Service } from '@vtex/api'

import clients from './clients'
import events from './events'
import graphql from './resolvers'
import routes from './routes'

export default new Service({ clients, graphql, routes, events })
