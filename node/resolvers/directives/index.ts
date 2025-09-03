import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { saveSchemas } from '../../utils'
import { BaseDirective } from './base/BaseDirective'

export class CheckSchemas extends BaseDirective {
  public async process(ctx: ServiceContext<Clients>) {
    return saveSchemas(ctx)
  }
}
