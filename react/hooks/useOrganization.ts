import { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import type { QueryGetUsersArgs } from 'vtex.b2b-organizations-graphql'
import type { SessionSuccess } from 'vtex.session-client'
import { useFullSession } from 'vtex.session-client'

import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import type {
  CustomOrganization,
  GetOrganizationQuery,
  SessionOrganizationData,
} from '../typings'

const SESSION_NAMESPACE = 'storefront-permissions'
const NAMESPACE_ITEMS = ['organization', 'costcenter']

export function useOrganization() {
  const { data: sessionData, loading: sessionLoading } = useFullSession({
    variables: {
      items: NAMESPACE_ITEMS.map((item) => `${SESSION_NAMESPACE}.${item}`),
    },
  })

  const session = sessionData?.session as SessionSuccess | undefined
  const organizationData: SessionOrganizationData =
    session?.namespaces[SESSION_NAMESPACE]

  const organizationId = organizationData?.organization.value
  const costCenterId = organizationData?.costcenter.value

  const { data, loading: organizationLoading } = useQuery<
    GetOrganizationQuery,
    QueryGetUsersArgs
  >(GET_ORGANIZATION, {
    ssr: false,
    skip: !organizationId,
    variables: { costCenterId, organizationId },
  })

  const organization: CustomOrganization = useMemo(() => {
    return {
      ...data?.getOrganizationByIdStorefront,
      users: data?.getUsers,
    }
  }, [data])

  const loading = sessionLoading || organizationLoading

  // eslint-disable-next-line no-console
  console.log('ORGANIZATION:', organization.users)

  return { organization, loading }
}
