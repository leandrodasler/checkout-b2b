import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import {
  Mutation,
  MutationSaveRepresentativeBalanceSettingsArgs,
} from 'ssesandbox04.checkout-b2b'
import { useRuntime } from 'vtex.render-runtime'
import {
  Button,
  InputCurrency,
  ToastProvider,
  Toggle,
  withToast,
} from 'vtex.styleguide'

import SAVE_REPRESENTATIVE_BALANCE_SETTINGS from '../graphql/saveRepresentativeBalanceSettings.graphql'
import { usePermissions } from '../hooks'
import { WithToast } from '../typings'
import { messages } from '../utils'

type MutationSaveRepresentativeBalanceSettings = Pick<
  Mutation,
  'saveRepresentativeBalanceSettings'
>

function RepresentativeBalanceSettingsContent({
  showToast,
}: Partial<WithToast>) {
  const { formatMessage } = useIntl()
  const { currency } = useRuntime().culture
  const {
    representativeBalanceEnabled,
    openingBalance,
    allowNegativeBalance,
  } = usePermissions()

  const [enabledInput, setEnabledInput] = useState<boolean>()
  const [
    allowNegativeBalanceInput,
    setAllowNegativeBalanceInput,
  ] = useState<boolean>()

  const [openingBalanceInput, setOpeningBalanceInput] = useState<number>()
  const currentEnabled = enabledInput ?? representativeBalanceEnabled
  const currentAllowNegativeBalance =
    allowNegativeBalanceInput ?? allowNegativeBalance

  const currentOpeningBalance = openingBalanceInput ?? openingBalance

  const [saveSettings, { loading }] = useMutation<
    MutationSaveRepresentativeBalanceSettings,
    MutationSaveRepresentativeBalanceSettingsArgs
  >(SAVE_REPRESENTATIVE_BALANCE_SETTINGS, {
    refetchQueries: ['getSettings'],
    awaitRefetchQueries: true,
    onError() {
      showToast?.({
        horizontalPosition: 'right',
        message: formatMessage(messages.representativeBalanceSettingsError),
      })
    },
    onCompleted(data) {
      showToast?.({
        horizontalPosition: 'right',
        message: formatMessage(messages.representativeBalanceSettingsSuccess),
      })

      const {
        enabled: enabledResponse,
        allowNegativeBalance: allowNegativeBalanceResponse,
        openingBalance: openingBalanceResponse,
      } = data.saveRepresentativeBalanceSettings

      setEnabledInput(enabledResponse)
      setAllowNegativeBalanceInput(allowNegativeBalanceResponse)
      setOpeningBalanceInput(openingBalanceResponse ?? undefined)
    },
  })

  const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    saveSettings({
      variables: {
        enabled: currentEnabled,
        openingBalance: currentOpeningBalance,
        allowNegativeBalance: currentAllowNegativeBalance,
      },
    })
  }

  const isChanged =
    currentEnabled !== representativeBalanceEnabled ||
    currentAllowNegativeBalance !== allowNegativeBalance ||
    currentOpeningBalance !== openingBalance

  return (
    <form
      className="flex items-center b--solid bw1 b--muted-3 br3 pa4 t-body"
      onSubmit={handleSaveSettings}
    >
      <div className="flex flex-column justify-center">
        <Toggle
          semantic
          id="representative-balances-enabled"
          label={formatMessage(messages.representativeBalanceSettingsEnabled)}
          checked={currentEnabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEnabledInput(e.target.checked)
          }
        />
        <div className="mt4">
          <Toggle
            semantic
            id="representative-balances-allow-negative"
            label={formatMessage(
              messages.representativeBalanceSettingsAllowNegative
            )}
            disabled={!currentEnabled}
            checked={currentAllowNegativeBalance}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAllowNegativeBalanceInput(e.target.checked)
            }
          />
        </div>
      </div>
      <div className="ml6">
        <InputCurrency
          disabled={!currentEnabled}
          label={formatMessage(
            messages.representativeBalanceSettingsOpeningBalance
          )}
          id="representative-opening-balance"
          size="small"
          currencyCode={currency}
          value={currentOpeningBalance}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOpeningBalanceInput(+e.target.value)
          }
        />
      </div>
      <div className="ml6">
        <Button
          isLoading={loading}
          disabled={!isChanged}
          size="small"
          variation="secondary"
          type="submit"
        >
          {formatMessage(messages.representativeBalanceSettingsSave)}
        </Button>
      </div>
    </form>
  )
}

const RepresentativeBalanceSettingsWithToast = withToast(
  RepresentativeBalanceSettingsContent
)

export function RepresentativeBalanceSettings() {
  return (
    <ToastProvider positioning="window">
      <RepresentativeBalanceSettingsWithToast />
    </ToastProvider>
  )
}
