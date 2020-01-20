#!/usr/bin/env node

const logger = require('../lib/logger')
const request = require('request')
const chalk = require('chalk')

console.log()
process.on('exit', () => {
  console.log()
})

request({
  url: 'https://api.github.com/users/lizuncong/repos',
  headers: {
    'User-Agent': 'create-app-cli',
  }
}, (err, res, body) => {
  if (err) logger.fatal(err)
  const requestBody = JSON.parse(body)
  if (Array.isArray(requestBody)) {
    console.log('  所有可用的模版:')
    console.log()
    requestBody.forEach(repo => {
      console.log(
        '  ' + chalk.yellow('★') +
        '  ' + chalk.blue(repo.name) +
        ' - ' + repo.description)
    })
  } else {
    console.error(chalk.red(`${requestBody.message}-${requestBody.documentation_url}`))
  }
})
