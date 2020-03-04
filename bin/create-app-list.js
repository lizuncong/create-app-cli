#!/usr/bin/env node
const chalk = require('chalk')
const { getTemplateList } = require('../lib/util')

getTemplateList().then(res => {
  res.forEach(repo => {
    console.log('所有可用的模版：\n')
    console.log(
      '  ' + chalk.yellow('★') +
      '  ' + chalk.blue(repo.name) +
      ' ： ' + repo.desc)
  })
})
