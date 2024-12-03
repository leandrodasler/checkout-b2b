import React from 'react'
import { useQuery } from 'react-apollo'

import GET_APP_SETTINGS from '../graphql/AppSettings.graphql'

interface AppSettings {
  message: string
  salesVendedor: number
}

interface AppSettingsQuery {
  appSettings: AppSettings
}

const AppSettingsComponent: React.FC = () => {
  const { data, loading, error } = useQuery<AppSettingsQuery>(
    GET_APP_SETTINGS,
    {
      ssr: false,
    }
  )

  // eslint-disable-next-line no-console
  console.log(data)

  if (loading) {
    return <p>Carregando configurações...</p>
  }

  if (error) {
    return <p>Erro ao carregar configurações: {error.message}</p>
  }

  if (!data || !data.appSettings) {
    return <p>Configurações não encontradas.</p>
  }

  const { message, salesVendedor } = data.appSettings

  return (
    <div>
      <h1>Configurações do Aplicativo</h1>
      <p>
        <strong>Mensagem:</strong> {message}
      </p>
      <p>
        <strong>Desconto do Vendedor:</strong> {salesVendedor}%
      </p>
    </div>
  )
}

export default AppSettingsComponent
