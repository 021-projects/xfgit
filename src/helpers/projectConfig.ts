import fs from 'fs'
import readFileJson from 'helpers/readFileJson.ts'
import path from 'path'

import type { ProjectConfig } from '@/types'

const projectConfig = readProjectConfig()

export function readProjectConfig(): ProjectConfig {
  const pwd = process.cwd()
  const configPath = path.join(pwd, 'xfgit.json')

  if (!fs.existsSync(configPath)) {
    return {}
  }

  return readFileJson<ProjectConfig>(configPath) || {}
}

export default projectConfig
