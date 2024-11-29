import { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import type { QueryGetUsersArgs } from 'vtex.b2b-organizations-graphql'
import type { SessionSuccess } from 'vtex.session-client'
import { useFullSession } from 'vtex.session-client'
import type { Query } from 'vtex.storefront-permissions'

import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import GET_PERMISSIONS from '../graphql/getPermissions.graphql'
import type {
  CustomOrganization,
  GetOrganizationQuery,
  SessionOrganizationData,
} from '../typings'
import { NAMESPACE_ITEMS, SESSION_NAMESPACE } from '../utils'

type GetPermissionsQuery = Pick<Query, 'checkUserPermission'>

export function useOrganization() {
  const { data: sessionData, loading: sessionLoading } = useFullSession({
    variables: {
      items: NAMESPACE_ITEMS.map((item) => `${SESSION_NAMESPACE}.${item}`),
    },
  })

  const session = sessionData?.session as SessionSuccess | undefined
  const organizationData: SessionOrganizationData | undefined =
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

  const {
    data: permissionsData,
    loading: permissionsLoading,
  } = useQuery<GetPermissionsQuery>(GET_PERMISSIONS, {
    ssr: false,
  })

  const organization: CustomOrganization = useMemo(() => {
    return {
      ...data?.getOrganizationByIdStorefront,
      users: data?.getUsers,
      costCenter: data?.getCostCenterByIdStorefront,
      role: permissionsData?.checkUserPermission?.role?.id ?? '',
    }
  }, [data, permissionsData])

  const loading = useMemo(
    () => sessionLoading || organizationLoading || permissionsLoading,
    [organizationLoading, permissionsLoading, sessionLoading]
  )

  return { organization, loading }
}
