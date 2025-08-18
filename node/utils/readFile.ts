import fs from 'fs'
import path from 'path'

export function readFile(filePath: string) {
  return fs.readFileSync(path.resolve(__dirname, filePath), 'utf8')
}
