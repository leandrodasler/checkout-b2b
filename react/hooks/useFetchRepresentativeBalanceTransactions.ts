import { useQuery } from 'react-apollo'

import GET_REPRESENTATIVE_BALANCE_TRANSACTIONS from '../graphql/getRepresentativeBalanceTransactions.graphql'

type UseRepresentativeBalanceTransactionsProps = {
  email?: string | null
  page?: number
  pageSize?: number
  sort?: string
  skip?: boolean
}

export const useFetchRepresentativeBalanceTransactions = ({
  email,
  page = 1,
  pageSize = 20,
  sort = 'createdIn desc',
  skip = !email,
}: UseRepresentativeBalanceTransactionsProps) => {
  const { data, loading, error, refetch } = useQuery(
    GET_REPRESENTATIVE_BALANCE_TRANSACTIONS,
    {
      variables: { email, page, pageSize, sort },
      skip,
      ssr: false,
    }
  )

  return {
    transactions: data?.getRepresentativeBalanceTransactions ?? [],
    loading,
    error,
    refetch,
  }
}
