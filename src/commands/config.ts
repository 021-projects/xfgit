import chalk from 'chalk'
import type { Command } from 'commander'
import { log } from 'helpers/console.ts'

import config from '@/config.ts'

type ConfigCommandOptions = {
  path?: boolean
}

export default class ConfigCommand {
  static register(program: Command) {
    const self = new this()

    program
      .command('config')
      .description('Show configuration or path to configuration file')
      .option('-p, --path', 'Show path to configuration file')
      .action(self.exec.bind(self))
  }

  exec(options: ConfigCommandOptions) {
    if (options.path) {
      log(
        chalk.green(
          `Configuration file path: ${chalk.underline(config.osPath())}`,
        ),
      )
      return
    }

    log(chalk.blue(JSON.stringify(config.get(), null, 2)))
  }
}
