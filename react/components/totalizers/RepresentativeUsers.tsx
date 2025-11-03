import React, { useMemo, useState } from 'react'

import { useOrganization } from '../../hooks'
import { MAX_SALES_USERS_TO_SHOW } from '../../utils'
import { ShowMoreButton } from './ShowMoreButton'

type Props = { title: string; b2bRole: string }

export function RepresentativeUsers({ title, b2bRole }: Props) {
  const { organization } = useOrganization()
  const { users } = organization
  const [showMore, setShowMore] = useState(false)

  const usersByRole = useMemo(
    () =>
      users
        ?.filter((user) => user?.roleId === b2bRole)
        .map((user) =>
          (!user?.name || user?.name?.includes('null')) && user?.email
            ? user.email
            : user?.name
        )
        .sort(),
    [b2bRole, users]
  )

  if (!usersByRole?.length) return null

  return (
    <span className="t-mini">
      <span className="b">{title}</span>{' '}
      {showMore
        ? usersByRole.join(', ')
        : usersByRole.slice(0, MAX_SALES_USERS_TO_SHOW).join(', ')}
      {usersByRole.length > MAX_SALES_USERS_TO_SHOW && (
        <ShowMoreButton
          isExpanded={showMore}
          onClick={() => setShowMore((prev) => !prev)}
        />
      )}
      <br />
    </span>
  )
}
