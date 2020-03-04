#!/usr/bin/env node
const program = require('commander')
const download = require('download-git-repo')
const chalk = require('chalk')
const path = require('path')
const exists = require('fs').existsSync
const generate = require('../lib/generate')
const rm = require('rimraf').sync
const home = require('user-home')
const ora = require('ora')
const inquirer = require('inquirer')
const { fatal } = require('../lib/util')

program
  .usage('<template-name> [project-name]')

program.on('--help', () => {
  console.log('  例子:')
  console.log()
  console.log(chalk.gray('    # 根据提供的模版创建项目'))
  console.log('    $ create-app init react-pc-template my-project')
  console.log()
})

program.parse(process.argv)
if (program.args.length < 1) {
  program.help()
}

const template = program.args[0] // 模版名称
const rawName = program.args[1] // 用户输入的项目名称
const inPlace = !rawName || rawName === '.' // 项目名为空或者为'.'， 则在当前目录下创建项目
// name项目名称，如果在当前目录下新建项目，则以当前目录名称做为项目名称
const name = inPlace ? path.relative('../', process.cwd()) : rawName // 项目名称
// 将生成的项目存到to目录下面
const to = path.resolve(rawName || '.')

// 存放项目模版文件的路径，将下载的模版存到tmp目录下面
const tmp = path.join(home, 'project-templates', template)

// 下载模版并初始化项目
const downloadAndGenerate = () => {
  const templateRepo = 'lizuncong/' + template
  const spinner = ora('正在下载模版')
  spinner.start()

  if (exists(tmp)) rm(tmp)

  // 下载template到指定的tmp本地路径中
  download(templateRepo, tmp, { clone: false }, err => {
    spinner.stop()
    if (err) fatal('下载模版失败 ' + templateRepo + ': ' + err.message.trim())
    generate(name, tmp, to, generateErr => {
      if (generateErr) fatal(generateErr)
      console.log()
      console.log('项目生成 "%s".', name)
    })
  })
}

if (inPlace || exists(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: inPlace
      ? '是否在当前目录创建项目?'
      : '目录已存在，是否继续?',
    name: 'ok'
  }]).then(answers => {
    if (answers.ok) {
      downloadAndGenerate()
    }
  }).catch(fatal)
} else {
  downloadAndGenerate()
}
