import chalk from 'chalk'
import fs from 'fs'
import { log } from 'helpers/console.ts'
import path from 'path'

interface SymlinkInfo {
  originalPath: string
  symlinkPath: string
}

export default class SymlinkManager {
  // Method to detach symlinks
  public async detachSymlinks(paths: string[]): Promise<SymlinkInfo[]> {
    const symlinkMap: SymlinkInfo[] = []

    for (const _path of paths) {
      const resolvedPath = path.resolve(_path)

      try {
        const stats = fs.lstatSync(resolvedPath)

        if (stats.isSymbolicLink()) {
          const originalPath = fs.readlinkSync(resolvedPath)

          symlinkMap.push({ originalPath, symlinkPath: resolvedPath })

          const originalResolvedPath = path.resolve(
            path.dirname(resolvedPath),
            originalPath,
          )

          fs.unlinkSync(resolvedPath)

          if (fs.existsSync(originalResolvedPath)) {
            const originalStats = fs.lstatSync(originalResolvedPath)

            if (originalStats.isDirectory()) {
              await this.copyDirectory(originalResolvedPath, resolvedPath)
            } else {
              fs.copyFileSync(originalResolvedPath, resolvedPath)
            }
          }
        }
      } catch (error) {
        console.error(`Failed to process '${_path}':`, error)
      }
    }

    return symlinkMap
  }

  // Helper method to copy directories recursively
  private async copyDirectory(src: string, dest: string): Promise<void> {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }

  // Method to restore symlinks
  public async restoreSymlinks(map: SymlinkInfo[]): Promise<void> {
    for (const { originalPath, symlinkPath } of map) {
      try {
        fs.rmSync(symlinkPath, { recursive: true, force: true })
        fs.symlinkSync(originalPath, symlinkPath)
      } catch (error) {
        log(chalk.red(`Failed to restore symlink for '${symlinkPath}':`, error))
      }
    }
  }
}
