import { useQuery } from 'react-apollo'
import type {
  Query,
  QueryGetOrganizationByIdArgs,
} from 'vtex.b2b-organizations-graphql'
import { SessionSuccess, useFullSession } from 'vtex.session-client'

import GET_ORGANIZATION from '../graphql/getOrganization.graphql'

export function useOrganization() {
  const { data: sessionData, loading: sessionLoading } = useFullSession()
  const session = sessionData?.session as SessionSuccess | undefined
  const storefrontPermissions = session?.namespaces['storefront-permissions']
  const organizationId: string = storefrontPermissions?.organization.value

  const { data: organization, loading: organizationLoading } = useQuery<
    Pick<Query, 'getOrganizationById'>,
    QueryGetOrganizationByIdArgs
  >(GET_ORGANIZATION, {
    variables: { id: organizationId },
    skip: !organizationId,
  })

  return {
    organization: organization?.getOrganizationById,
    loading: organizationLoading || sessionLoading,
  }
}
