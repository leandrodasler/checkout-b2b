import { useMutation } from 'react-apollo'
import {
  Mutation,
  MutationUpdateSavedCartTitleArgs,
} from 'ssesandbox04.checkout-b2b'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import UPDATE_SAVED_CART_TITLE from '../graphql/updateSavedCartTitle.graphql'
import { useToast } from './useToast'

type MutationUpdateSavedCartTitle = Pick<Mutation, 'updateSavedCartTitle'>

type Props = { id?: string; title: string; onCompleted?: () => void }

export function useUpdateSavedCartTitle({ id, title, onCompleted }: Props) {
  const showToast = useToast()
  const { setSelectedCart, setPending } = useCheckoutB2BContext()

  const [updateSavedCartTitle, { loading }] = useMutation<
    MutationUpdateSavedCartTitle,
    MutationUpdateSavedCartTitleArgs
  >(UPDATE_SAVED_CART_TITLE, {
    notifyOnNetworkStatusChange: true,
    onError: showToast,
    onCompleted(data) {
      setSelectedCart(data.updateSavedCartTitle)
    },
  })

  const handleUpdateSavedCartTitle = () => {
    if (!id) return

    setPending(true)

    updateSavedCartTitle({ variables: { id, title } }).finally(() => {
      setPending(false)
      onCompleted?.()
    })
  }

  return { handleUpdateSavedCartTitle, loading }
}
