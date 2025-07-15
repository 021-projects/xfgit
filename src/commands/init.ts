import { file } from 'bun'
import Case from 'case'
import chalk from 'chalk'
import { type Command } from 'commander'
import fs from 'fs'
import { log } from 'helpers/console.ts'
import path from 'path'

import rootGitignore from '@/stubs/root_gitignore.stub' with { type: 'file' }
import srcGitignore from '@/stubs/src_gitignore.stub' with { type: 'file' }

type InitCommandOptions = {
  js?: boolean
}

export default class InitCommand {
  static register(program: Command) {
    const self = new this()

    program
      .command('init')
      .description('Create default add-on files in the current directory')
      .argument('<addon-id>', 'The add-on ID to initialize')
      .option('--js', 'Create a js folder')
      .action(self.exec.bind(self))
  }

  async exec(addOnId: string, options: InitCommandOptions) {
    const pwd = process.cwd()
    const addOnDir = `src/addons/${addOnId}`

    if (!fs.existsSync(addOnDir)) {
      fs.mkdirSync(addOnDir, { recursive: true })
      log(chalk.blue(`Created directory: ./${addOnDir}`))
    }

    if (options.js) {
      const jsAddOnId = addOnId.split('/').map(Case.snake).join('/')
      const jsDir = `js/${jsAddOnId}`
      if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir, { recursive: true })
        log(chalk.blue(`Created directory: ./${jsDir}`))
      }
    }

    fs.writeFileSync(
      path.join(pwd, '.gitignore'),
      await file(rootGitignore).text(),
    )
    fs.writeFileSync(
      path.join(addOnDir, '.gitignore'),
      await file(srcGitignore).text(),
    )

    log(chalk.green('Initialized add-on with default files.'))
  }
}
