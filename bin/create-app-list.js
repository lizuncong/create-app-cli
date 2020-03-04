#!/usr/bin/env node
const chalk = require('chalk')
const { getTemplateList } = require('../lib/util')

getTemplateList().then(res => {
  res.forEach(repo => {
    console.log(
      '  ' + chalk.yellow('★') +
      '  ' + chalk.blue(repo.name) +
      ' ： ' + repo.desc)
  })
})
