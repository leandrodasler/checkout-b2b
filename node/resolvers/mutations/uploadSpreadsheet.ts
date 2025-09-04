import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'

type FileUpload = Promise<{
  filename: string
  mimetype: string
  encoding: string
  createReadStream: () => NodeJS.ReadableStream
}>

export const uploadSpreadsheet = async (
  _: unknown,
  { file }: { file: FileUpload },
  _ctx: ServiceContext<Clients>
) => {
  const loadedFile = await file
  const { filename, mimetype, encoding } = loadedFile

  // eslint-disable-next-line no-console
  console.log('📂 Arquivo recebido:', {
    filename,
    mimetype,
    encoding,
  })

  return {
    filename,
    mimetype,
    encoding,
  }
}
