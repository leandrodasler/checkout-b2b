import { useQuery } from 'react-apollo'

import GET_REPRESENTATIVE_BALANCE_BY_EMAIL from '../graphql/getRepresentativeBalanceByEmail.graphql'

type UseRepresentativeBalanceProps = {
  email?: string | null
  skip?: boolean
}

export const useFetchRepresentativeBalance = ({
  email,
  skip = !email,
}: UseRepresentativeBalanceProps) => {
  const { data, loading, error, refetch } = useQuery(
    GET_REPRESENTATIVE_BALANCE_BY_EMAIL,
    {
      // TODO: Remove this hardcoded email when the user is logged in
      variables: { email: 'tiago.freire+sales-representative@cubos.io' },
      skip,
      ssr: false,
    }
  )

  return {
    representativeBalance: data?.getRepresentativeBalanceByEmail ?? null,
    loading,
    error,
    refetch,
  }
}
