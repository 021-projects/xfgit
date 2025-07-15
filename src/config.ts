import fs from 'fs'
import readFileJson from 'helpers/readFileJson.ts'
import os from 'os'
import path from 'path'

type IConfig = {
  pathAliases?: Record<string, string>
}

class Config {
  private config: IConfig = {}

  constructor() {
    const configPath = this.osPath()
    if (!fs.existsSync(configPath)) {
      return
    }

    try {
      this.config = readFileJson<IConfig>(configPath)!
    } catch (error) {
      console.error(`Error reading config file at ${configPath}:`, error)
    }
  }

  get(key?: keyof IConfig) {
    if (key) {
      return this.config[key]
    }

    return this.config
  }

  set(key: keyof IConfig, value: any) {
    this.config[key] = value
    this.save()
  }

  save() {
    const configPath = this.osPath()

    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true })
    }

    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2), 'utf-8')
  }

  pathAliases() {
    if (!this.config.pathAliases) {
      return {}
    }

    return this.config.pathAliases
  }

  pathAlias(key: string) {
    if (!this.config.pathAliases) {
      return undefined
    }

    return this.config.pathAliases[key]
  }

  osPath() {
    const homeDir = os.homedir()

    return process.platform === 'win32'
      ? path.join(process.env.APPDATA || '', 'xfgit', 'config.json')
      : path.join(homeDir, '.config', 'xfgit', 'config.json')
  }
}

export default new Config()
