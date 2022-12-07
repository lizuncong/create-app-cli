const request = require('request')
const chalk = require('chalk')
const exec = require('child_process').execSync
const format = require('util').format

const TEMPLATE_REPO = 'https://api.github.com/users/lizuncong/repos?per_page=100'

const fatal = function (...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim()
  const msg = format.apply(format, args)
  console.error(chalk.red('create-app-cli'), msg)
  process.exit(1)
}

// 获取用户Git用户名及邮箱
exports.getGitUserInfo = () => {
  let name = exec('git config --get user.name')
  let email = exec('git config --get user.email')
  name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
  email = email && (' <' + email.toString().trim() + '>')
  return (name || '') + (email || '')
}

// 获取仓库提供的模版列表
exports.getTemplateList = () => new Promise((resolve) => {
  request({
    url: TEMPLATE_REPO,
    headers: {
      'User-Agent': 'create-app-cli'
    }
  }, (err, res, body) => {
    if (err) fatal(err)
    const requestBody = JSON.parse(body)
    if (Array.isArray(requestBody)) {
      const templateList = requestBody
        .filter(repo => repo.name.indexOf('template') > -1)
        .map(repo => ({
          name: repo.name,
          desc: repo.description
        }))
      resolve(templateList)
    } else {
      console.error(chalk.red(`${requestBody.message}-${requestBody.documentation_url}`))
    }
  })
})

exports.fatal = fatal
