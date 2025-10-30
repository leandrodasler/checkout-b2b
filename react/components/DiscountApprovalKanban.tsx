import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { SavedCart, SavedCartStatus } from 'ssesandbox04.checkout-b2b'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import {
  ButtonPlain,
  ButtonWithIcon,
  Card,
  IconDelete,
  IconShoppingCart,
  Tag,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { useDeleteSavedCart, useOrganization, useSavedCart } from '../hooks'
import { messages } from '../utils/messages'
import { IconUpdateHistory } from './IconUpdateHistory'
import { SavedCartDiscountBadge } from './SavedCartDiscountBadge'

interface DiscountApprovalKanbanProps {
  requests?: SavedCart[]
  onChangeCartStatus: (id: string, status: SavedCartStatus) => void
  isLoadingChangeCartStatus: boolean
  onUseCart: () => void
  onChangeItems: () => void
}

interface CartData {
  value: number
}

const ROLES = {
  ADMIN: 'sales-admin',
  MANAGER: 'sales-manager',
  REP: 'sales-representative',
} as const

const STATUSES: Record<string, SavedCartStatus> = {
  OPEN: 'open',
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  ORDER_PLACED: 'orderPlaced',
}

export function DiscountApprovalKanban({
  requests = [],
  onChangeCartStatus,
  isLoadingChangeCartStatus,
  onUseCart,
  onChangeItems,
}: DiscountApprovalKanbanProps) {
  const { locale } = useRuntime().culture
  const { formatMessage } = useIntl()
  const { selectedCart } = useCheckoutB2BContext()
  const { organization } = useOrganization()

  const currentUserRole = organization?.role

  const { handleUseSavedCart, loading: loadingUseCart } = useSavedCart({
    onChangeItems,
  })

  const [deleteCart, { loading: loadingDeleteCart }] = useDeleteSavedCart({
    onChangeItems,
    options: { refetchQueries: ['getAllSavedCarts'] },
  })

  const [updatingCart, setUpdatingCart] = useState<{
    id: string
    status: SavedCartStatus
  } | null>(null)

  const deletingCart = useRef<string>()

  const parseCartData = useCallback((data: string): CartData => {
    try {
      return JSON.parse(data)
    } catch {
      return { value: 0 }
    }
  }, [])

  const canManageCart = useCallback(
    (cartRoleId?: string | null) => {
      switch (currentUserRole) {
        case ROLES.ADMIN:
          return cartRoleId === ROLES.MANAGER || cartRoleId === ROLES.REP

        case ROLES.MANAGER:
          return cartRoleId === ROLES.REP

        default:
          return false
      }
    },
    [currentUserRole]
  )

  const filterCartsByUserRole = useCallback(
    (carts: SavedCart[], columnKey: string) => {
      if (columnKey !== STATUSES.PENDING) return carts

      switch (currentUserRole) {
        case ROLES.ADMIN:
          return carts

        case ROLES.MANAGER:
          return carts.filter(
            (c) => c.roleId === ROLES.MANAGER || c.roleId === ROLES.REP
          )

        case ROLES.REP:
          return carts.filter((c) => c.roleId === ROLES.REP)

        default:
          return []
      }
    },
    [currentUserRole]
  )

  const columns = useMemo(
    () => [
      { key: STATUSES.OPEN, label: formatMessage(messages.discountStatusOpen) },
      {
        key: STATUSES.PENDING,
        label: formatMessage(messages.discountStatusPending),
      },
      {
        key: STATUSES.APPROVED,
        label: formatMessage(messages.discountStatusApproved),
      },
      {
        key: STATUSES.DENIED,
        label: formatMessage(messages.discountStatusDenied),
      },
      {
        key: STATUSES.ORDER_PLACED,
        label: formatMessage(messages.discountStatusOrderApproved),
      },
    ],
    [formatMessage]
  )

  const filteredColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      carts: filterCartsByUserRole(requests, col.key).filter(
        (c) => c.status === col.key
      ),
    }))
  }, [columns, requests, filterCartsByUserRole])

  const handleChangeCartStatus = useCallback(
    (id: string, status: SavedCartStatus) => () => {
      setUpdatingCart({ id, status })
      onChangeCartStatus(id, status)
    },
    [onChangeCartStatus]
  )

  const isLoading = useCallback(
    (id: string, status: SavedCartStatus) =>
      isLoadingChangeCartStatus &&
      updatingCart?.id === id &&
      updatingCart?.status === status,
    [isLoadingChangeCartStatus, updatingCart]
  )

  return (
    <div className="flex flex-row justify-between overflow-x-auto pa2">
      {filteredColumns.map(({ key, label, carts }) => (
        <div
          key={key}
          className="flex flex-column mh3 bg-muted-5 br3 flex-grow-1"
          style={{ flex: 1 }}
        >
          <div
            className="mt4 mh5 c-action-primary br3 b flex items-center justify-between"
            style={{ gap: 6 }}
          >
            <span>{label}</span>
            <Tag>{carts.length}</Tag>
          </div>

          <div
            className="flex flex-column mt3 pa3 overflow-auto"
            style={{
              maxHeight: '520px',
              gap: '6px',
            }}
          >
            {carts.length === 0 && (
              <span className="c-muted-2 ph4 pt2">
                {formatMessage(messages.noRequests)}
              </span>
            )}

            {carts.map((cart) => {
              const isCurrent = selectedCart?.id === cart.id
              const tooltipLabel = isCurrent
                ? formatMessage(messages.savedCartsInUseLabel)
                : formatMessage(messages.savedCartsSelectLabel)

              const canManage = canManageCart(cart.roleId)

              return (
                <Card key={cart.id} noPadding>
                  <div
                    style={{ gap: 6 }}
                    className={`flex flex-column pa6 br2 ${
                      isCurrent ? 'bg-washed-blue' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="c-muted-1">
                        <span className="t-mini nowrap">
                          {new Date(cart.createdIn).toLocaleString(locale)}
                        </span>
                      </div>
                      <Tooltip
                        label={formatMessage(messages.savedCartsUpdateHistory)}
                      >
                        <div>
                          <ButtonWithIcon
                            size="small"
                            variation="tertiary"
                            icon={
                              <IconUpdateHistory
                                quantity={cart.updateQuantity}
                              />
                            }
                            onClick={() => {} /* TODO */}
                            isLoading={false /* TODO */}
                            disabled={false /* TODO */}
                            style={{ padding: 0 }}
                          />
                        </div>
                      </Tooltip>

                      <Tooltip label={formatMessage(messages.delete)}>
                        <div>
                          <ButtonWithIcon
                            size="small"
                            variation="danger-tertiary"
                            icon={<IconDelete size={16} />}
                            onClick={() => {
                              deletingCart.current = cart.id
                              deleteCart({ variables: { id: cart.id } })
                            }}
                            isLoading={
                              loadingDeleteCart &&
                              deletingCart.current === cart.id
                            }
                            disabled={loadingUseCart || loadingDeleteCart}
                            style={{ padding: 0 }}
                          />
                        </div>
                      </Tooltip>

                      <Tooltip label={tooltipLabel}>
                        <div>
                          <ButtonWithIcon
                            size="small"
                            variation="tertiary"
                            icon={<IconShoppingCart size={16} />}
                            onClick={() =>
                              handleUseSavedCart(cart).then(onUseCart)
                            }
                            isLoading={loadingUseCart && isCurrent}
                            disabled={
                              loadingUseCart || loadingDeleteCart || isCurrent
                            }
                            style={{ padding: 0 }}
                          />
                        </div>
                      </Tooltip>
                    </div>

                    <div className="c-action-primary">
                      <span className="fw5">{cart.title}</span>
                    </div>

                    <div className="c-muted-1 f6 flex flex-column flex-wrap">
                      <span style={{ wordWrap: 'break-word' }}>
                        {cart.email}
                      </span>
                      <div>
                        <Tag size="small" variation="low">
                          {cart.roleId}
                        </Tag>
                      </div>
                    </div>

                    <div className="flex items-center" style={{ gap: 6 }}>
                      <span className="fw5">
                        <FormattedPrice
                          value={parseCartData(cart.data)?.value / 100}
                        />
                      </span>
                      <SavedCartDiscountBadge
                        discount={cart.requestedDiscount}
                      />
                    </div>

                    {cart.status === STATUSES.PENDING && canManage && (
                      <div className="flex justify-between mt2">
                        <ButtonPlain
                          size="small"
                          variant="primary"
                          onClick={handleChangeCartStatus(
                            cart.id,
                            STATUSES.DENIED
                          )}
                          isLoading={isLoading(cart.id, STATUSES.DENIED)}
                        >
                          {formatMessage(messages.discountKanbanModalDeny)}
                        </ButtonPlain>
                        <ButtonPlain
                          size="small"
                          variant="primary"
                          onClick={handleChangeCartStatus(
                            cart.id,
                            STATUSES.APPROVED
                          )}
                          isLoading={isLoading(cart.id, STATUSES.APPROVED)}
                        >
                          {formatMessage(messages.discountKanbanModalApprove)}
                        </ButtonPlain>
                      </div>
                    )}

                    {[STATUSES.APPROVED, STATUSES.DENIED].includes(
                      cart.status
                    ) &&
                      canManage && (
                        <div className="mt2">
                          <ButtonPlain
                            size="small"
                            variant="primary"
                            onClick={handleChangeCartStatus(
                              cart.id,
                              STATUSES.PENDING
                            )}
                            isLoading={isLoading(cart.id, STATUSES.PENDING)}
                          >
                            {formatMessage(messages.cancel)}
                          </ButtonPlain>
                        </div>
                      )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
