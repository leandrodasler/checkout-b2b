import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'

type FileUpload = Promise<{
  filename: string
  mimetype: string
  encoding: string
  createReadStream: () => ReadableStream
}>

export const uploadSpreadsheet = async (
  _: unknown,
  { file }: { file: FileUpload },
  _ctx: ServiceContext<Clients>
) => {
  const loadFile = await (file as FileUpload)
  const { filename, mimetype, encoding } = loadFile

  // eslint-disable-next-line no-console
  console.log(
    `Uploading file: ${filename}, Type: ${mimetype}, Encoding: ${encoding}`
  )

  return {
    filename,
    mimetype,
    encoding,
  }
}
