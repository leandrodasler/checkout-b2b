import { Item } from 'vtex.checkout-graphql'

export * from './messages'

export function normalizeString(str?: string | null) {
  return (
    str
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f\s]/g, '')
      .toLowerCase() ?? ''
  )
}

export function isWithoutStock(item: Item) {
  return item.availability === 'withoutStock'
}
