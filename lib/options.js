const path = require('path')
const exists = require('fs').existsSync
const getGitUser = require('./git-user')
const validateName = require('validate-npm-package-name')


// 读取模版中的meta.js文件并设置默认的项目名称及作者
module.exports = function options (name, dir) {

  const opts = getMetadata(dir)

  setDefault(opts, 'name', name)

  // 校验项目名称是否符合npm的规范
  setValidateName(opts)

  const author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}


// 读取meta.js文件
function getMetadata (dir) {
  const js = path.join(dir, 'meta.js')
  let opts = {}
  if (exists(js)) {
    const req = require(path.resolve(js))
    if (req !== Object(req)) {
      throw new Error('meta.js需要导出一个对象')
    }
    opts = req
  }

  return opts
}


function setDefault (opts, key, val) {
  const prompts = opts.prompts || (opts.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    }
  } else {
    prompts[key]['default'] = val
  }
}

function setValidateName (opts) {
  const name = opts.prompts.name
  name.validate = name => {
    const its = validateName(name)
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || [])
      return '项目名称不符合npm规范, ' + errors.join(' and ') + '.'
    }
    return true
  }
}
