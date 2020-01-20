const chalk = require('chalk')
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const async = require('async')
const render = require('consolidate').handlebars.render
const path = require('path')
const getOptions = require('./options')
const ask = require('./ask')
const filter = require('./filter')

// name：项目名称 src：本地模版路径  dest生成的项目目录
module.exports = function generate (name, src, dest, done) {

  // 读取项目模版里面的meta.js文件

  const opts = getOptions(name, src)
  const metalsmith = Metalsmith(path.join(src, 'template'))
  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
  })

  opts.helpers && Object.keys(opts.helpers).map(key => {
    Handlebars.registerHelper(key, opts.helpers[key])
  })

  metalsmith.use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles())

  metalsmith.clean(false) // clean：false不清空目标目录
    .source('.') // 从template根目录开始读取文件， Metalsmith默认从./src目录开始读取文件
    .destination(dest)
    .build((err, files) => {
      done(err)
      if (typeof opts.complete === 'function') {
        const helpers = { chalk }
        opts.complete(data, helpers)
      }
    })
  return data
}


function askQuestions (prompts) {
  return (files, metalsmith, done) => {
    // 调用done触发下一步
    ask(prompts, metalsmith.metadata(), done)
  }
}


function filterFiles (filters) {
  return (files, metalsmith, done) => {
    filter(files, filters, metalsmith.metadata(), done)
  }
}

function renderTemplateFiles () {

  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metalsmithMetadata = metalsmith.metadata()
    async.each(keys, (file, next) => {
      const str = files[file].contents.toString()

      // 如果文件中没有{{}}， 则不需要渲染
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next()
      }
      render(str, metalsmithMetadata, (err, res) => {
        if (err) {
          err.message = `[${file}] ${err.message}`
          return next(err)
        }
        files[file].contents = new Buffer.from(res)
        next()
      })
    }, done)
  }
}
