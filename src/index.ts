import { Command } from 'commander'
import AliasCommand from 'commands/alias.ts'
import BuildCommand from 'commands/build/build.ts'
import ConfigCommand from 'commands/config.ts'
import InitCommand from 'commands/init.ts'
import LinkCommand from 'commands/link.ts'

const program = new Command()
const commands = [
  AliasCommand,
  BuildCommand,
  ConfigCommand,
  InitCommand,
  LinkCommand,
]

program.name('xfgit').version('1.0.0')

commands.forEach((CommandClass) => {
  CommandClass.register(program)
})

program.parse()
