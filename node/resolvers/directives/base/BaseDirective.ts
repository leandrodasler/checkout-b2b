import { ServiceContext } from '@vtex/api'
import type { GraphQLField, GraphQLResolveInfo } from 'graphql'
import { defaultFieldResolver } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

import { Clients } from '../../../clients'

export abstract class BaseDirective extends SchemaDirectiveVisitor {
  abstract process(
    ctx: ServiceContext<Clients>,
    info?: GraphQLResolveInfo,
    args?: Record<string, unknown>
  ): Promise<void>

  public visitFieldDefinition(
    field: GraphQLField<
      unknown,
      ServiceContext<Clients>,
      Record<string, unknown>
    >
  ) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async (...params) => {
      const [root, args, ctx, info] = params

      await this.process(ctx, info, args)

      return resolve(root, args, ctx, info)
    }
  }
}
