import chalk from 'chalk'
import { exec } from 'child_process'
import { type Command } from 'commander'
import fs from 'fs'
import { log } from 'helpers/console.ts'
import readFileJson from 'helpers/readFileJson.ts'
import sanitizeAddOnId from 'helpers/sanitizeAddOnId.ts'
import path from 'path'

import type { AddOn, BuildJson } from '@/types'

import SymlinkManager from './symlinkManager.ts'

export default class BuildCommand {
  static register(program: Command) {
    const self = new this()

    program
      .command('build')
      .description('Build an add-on')
      .argument('<addon-id>', 'The ID of the add-on to build')
      .action(self.exec.bind(self))
  }

  symlinkManager: SymlinkManager = new SymlinkManager()

  async exec(addOnId: string) {
    const pwd = process.cwd()

    if (!fs.existsSync(path.resolve(pwd, 'cmd.php'))) {
      log(
        chalk.red(
          'This command must be run from the root of the XenForo project.',
        ),
      )
      process.exit(1)
    }

    const addOnPath = path.resolve(pwd, 'src/addons', addOnId)

    if (!fs.existsSync(addOnPath)) {
      log(chalk.red(`Add-on directory does not exist: ${addOnPath}`))
      process.exit(1)
    }

    const addOn = readFileJson<AddOn>(path.join(addOnPath, 'addon.json'))
    if (!addOn) {
      log(chalk.red(`Failed to read addon.json for ${addOnId}`))
      process.exit(1)
    }

    const buildJsonPath = path.join(addOnPath, 'build.json')
    const buildJson: BuildJson = fs.existsSync(buildJsonPath)
      ? (readFileJson(buildJsonPath) as BuildJson)
      : {}

    const additionalFiles = buildJson.additional_files || []

    const symlinksToDetach = [
      addOnPath,
      ...additionalFiles.filter((file) => {
        const filePath = path.resolve(pwd, file)

        return (
          fs.existsSync(filePath) && fs.lstatSync(filePath).isSymbolicLink()
        )
      }),
    ]

    if (!symlinksToDetach.length) {
      await this.runBuildCommand(addOnId)
      return
    }

    const symlinkMap =
      await this.symlinkManager.detachSymlinks(symlinksToDetach)
    const restoreSymlinks = async () => {
      await this.symlinkManager.restoreSymlinks(symlinkMap)

      if (symlinkMap.length) {
        log(chalk.blue('Symlinks restored successfully.'))
      }
    }

    if (symlinkMap.length) {
      log(chalk.blue('Symlinks detached successfully.'))
    }

    try {
      await this.runBuildCommand(addOnId)
    } catch {
      await restoreSymlinks()
      return
    }

    const releaseFileName = this.releaseFileName(addOnId, addOn)
    const releasePath = path.join(addOnPath, '_releases', releaseFileName)

    if (!fs.existsSync(path.dirname(releasePath))) {
      log(
        chalk.red(`Release file does not exist: ${path.dirname(releasePath)}`),
      )
      await restoreSymlinks()

      return
    }

    const tmpDir = fs.mkdtempSync(`build-${sanitizeAddOnId(addOnId)}`)
    const tmpReleasePath = path.join(tmpDir, releaseFileName)

    fs.copyFileSync(releasePath, tmpReleasePath)

    await restoreSymlinks()

    fs.copyFileSync(tmpReleasePath, releasePath)
    fs.rmSync(tmpDir, { recursive: true, force: true })

    log(chalk.green(`Release file created: ${chalk.underline(releasePath)}`))

    log(chalk.green('Build completed successfully 🔥'))
  }

  runBuildCommand(addonId: string): Promise<void> {
    const pwd = process.cwd()
    const cmd = `php cmd.php xf-addon:build ${addonId}`

    log(chalk.blue(`Running build command: ${cmd}`))

    return new Promise((resolve, reject) => {
      exec(
        cmd,
        { cwd: pwd },
        (error: Error | null, stdout: string, stderr: string) => {
          if (error) {
            log(chalk.red(`Error executing command: ${error.message}`))
            reject(error)
            return
          }

          if (stderr) {
            log(chalk.yellow(stderr))
          }

          log(chalk.yellow(stdout))
          resolve()
        },
      )
    })
  }

  releaseFileName(addOnId: string, addOn: AddOn): string {
    const version = addOn.version_string
    return `${sanitizeAddOnId(addOnId)}-${version}.zip`
  }
}
