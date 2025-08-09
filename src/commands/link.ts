import chalk from 'chalk'
import { type Command } from 'commander'
import fs from 'fs'
import { log } from 'helpers/console.ts'
import projectConfig from 'helpers/projectConfig.ts'
import path from 'path'

import config from '@/config.ts'

export default class LinkCommand {
  skipRules = [
    'xfgit.json',
    '.gitignore',
    (file: string) => file.startsWith('.'),
  ]

  static register(program: Command) {
    const self = new this()

    const aliases = Object.keys(config.pathAliases()).join(', ') || '<none>'

    program
      .command('link')
      .description(
        'Create symlinks for add-on files from current directory to a target directory',
      )
      .argument('<target>', `Target directory or alias (${aliases})`)
      .action(self.exec.bind(self))
  }

  exec(target: string) {
    const pwd = process.cwd()
    const targetPath = config.pathAlias(target) || path.resolve(target)

    if (!fs.existsSync(targetPath)) {
      log(chalk.red('Target directory does not exist:', targetPath))
      process.exit(1)
    }

    if (projectConfig.exclude && Array.isArray(projectConfig.exclude)) {
      this.skipRules.push(
        ...projectConfig.exclude.map((rule) => {
          // Absolute path
          if (rule.startsWith('/')) {
            return rule
          }

          return `${pwd}/${rule}`
        }),
      )
    }

    const pathMappings = {
      js: 'js',
      src: 'src/addons',
      stylesDefault: 'styles/default',
      styles: 'styles',
    }

    Object.entries(pathMappings).forEach(([, subPath]) => {
      const fullPath = path.join(pwd, subPath)
      if (fs.existsSync(fullPath)) {
        this.createSymlinks(fullPath, path.join(targetPath, subPath))
      }
    })

    this.findFiles(pwd).forEach((file) => {
      const targetFile = path.join(targetPath, path.basename(file))
      if (!fs.existsSync(targetFile)) {
        fs.symlinkSync(file, targetFile, 'file')
        log(chalk.green(`Linked file: ${file} -> ${targetFile}`))
      } else {
        log(chalk.yellow(`Skipping existing file: ${targetFile}`))
      }
    })
  }

  createSymlinks(dir: string, targetBasePath: string) {
    const dirs = this.findDirs(dir)
    dirs.forEach((brandDir) => {
      const targetBrandDir = path.join(targetBasePath, path.basename(brandDir))
      if (!fs.existsSync(targetBrandDir)) {
        log(chalk.cyan(`Creating directory: ${targetBrandDir}`))
        fs.mkdirSync(targetBrandDir, { recursive: true })
      }

      this.findDirs(brandDir).forEach((srcDir) => {
        const targetSrcDir = path.join(targetBrandDir, path.basename(srcDir))
        if (fs.existsSync(targetSrcDir)) {
          log(chalk.yellow(`Skipping existing symlink: ${targetSrcDir}`))
          return
        }

        log(chalk.green(`Creating symlink: ${srcDir} -> ${targetSrcDir}`))
        fs.symlinkSync(srcDir, targetSrcDir, 'dir')
      })
    })
  }

  findDirs(dir: string): string[] {
    return this.applySkipRules(
      fs
        .readdirSync(path.resolve(dir), { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => path.join(path.resolve(dir), item.name)),
    )
  }

  findFiles(dir: string): string[] {
    return this.applySkipRules(
      fs
        .readdirSync(path.resolve(dir), { withFileTypes: true })
        .filter((item) => item.isFile())
        .map((item) => path.join(path.resolve(dir), item.name)),
    )
  }

  applySkipRules(files: string[]): string[] {
    return files.filter((file) => {
      return !this.skipRules.some((rule) => {
        if (typeof rule === 'string') {
          return file.includes(rule)
        } else if (typeof rule === 'function') {
          return rule(file)
        }
        return false
      })
    })
  }
}
