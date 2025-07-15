import chalk from 'chalk'
import fs from 'fs'

import { log } from './console.ts'

export default function readFileJson<T>(filePath: string): T | null {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch {
    log(chalk.red(`Error reading or parsing JSON file: ${filePath}`))
    return null
  }
}
