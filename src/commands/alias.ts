import chalk from 'chalk'
import type { Command } from 'commander'
import { log } from 'helpers/console.ts'

import config from '@/config.ts'

type AliasCommandOptions = {
  remove?: boolean
}

export default class AliasCommand {
  static register(program: Command) {
    const self = new this()

    program
      .command('alias')
      .description('Create an alias for a path')
      .argument('<alias>', 'The path to alias')
      .argument('<path>', 'The path to alias to')
      .option('-r, --remove', 'Remove an existing alias')
      .action(self.exec.bind(self))
  }

  exec(alias: string, path: string, options: AliasCommandOptions) {
    const aliases = config.pathAliases()

    if (!options.remove && aliases[alias]) {
      log(chalk.blue(`Alias already exists: ${alias} -> ${aliases[alias]}`))
      return
    }

    if (options.remove) {
      delete aliases[alias]
    } else {
      aliases[alias] = path
    }

    config.set('pathAliases', aliases)
    config.save()

    if (options.remove) {
      log(chalk.red(`Alias removed: ${alias}`))
    } else {
      log(chalk.green(`Alias created: ${alias} -> ${path}`))
    }
  }
}
