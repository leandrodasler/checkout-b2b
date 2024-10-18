import { useQuery } from 'react-apollo'
import type { Query } from 'vtex.b2b-organizations-graphql'

import GET_ORGANIZATION from '../graphql/getOrganization.graphql'

type GetOrganizationQuery = Pick<Query, 'getOrganizationByIdStorefront'>

export function useOrganization() {
  const { data, loading } = useQuery<GetOrganizationQuery>(GET_ORGANIZATION, {
    ssr: false,
  })

  const organization = data?.getOrganizationByIdStorefront

  return { organization, loading }
}
