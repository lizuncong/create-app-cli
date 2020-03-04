const path = require('path')
const { getGitUserInfo } = require('./util')
const validateName = require('validate-npm-package-name')

module.exports = (name, dir) => {
  const opts = require(path.join(dir, 'meta.js'))

  const namePrompts = opts.prompts.name
  // 设置默认的项目名称
  namePrompts.default = name
  // 校验项目名称是否符合npm的规范
  namePrompts.validate = name => {
    const its = validateName(name)
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || [])
      return '项目名称不符合npm规范, ' + errors.join(' 且 ') + '.'
    }
    return true
  }

  const author = getGitUserInfo()
  if (author) {
    // 用当前用户Git账户信息设置项目作者
    opts.prompts.author.default = author
  }

  return opts
}
