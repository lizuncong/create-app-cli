const chalk = require('chalk')
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const async = require('async')
const render = require('consolidate').handlebars.render
const path = require('path')
const inquirer = require('inquirer')
const getMetaOptions = require('./meta-options')
const match = require('minimatch')

// name：项目名称 src：本地模版路径  dest生成的项目目录
module.exports = (name, src, dest, done) => {
  const opts = getMetaOptions(name, src)
  const metalsmith = Metalsmith(path.join(src, 'template'))

  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd()
  })

  opts.helpers && Object.keys(opts.helpers).map(key => {
    Handlebars.registerHelper(key, opts.helpers[key])
  })

  metalsmith
    .clean(false) // clean：false不清空目标目录
    .source('.') // 从template根目录开始读取文件， Metalsmith默认从./src目录开始读取文件
    .destination(dest)
    .use(askQuestions(opts.prompts)) // 收集用户输入的信息
    .use(filterFiles(opts.filters)) // 根据用户输入删除相应的文件
    .use(renderTemplateFiles()) // 生成模版文件
    .build((err) => {
      done(err)
      if (typeof opts.complete === 'function') {
        const helpers = { chalk }
        console.log('complete...data....', data)
        opts.complete(data, helpers)
      }
    })
  return data
}

const askQuestions = (prompts) => {
  return (files, metalsmith, done) => {
    const metaData = metalsmith.metadata()
    async.eachSeries(Object.keys(prompts), (key, next) => {
      const prompt = prompts[key]
      inquirer.prompt([{
        type: prompt.type,
        name: key,
        message: prompt.message || prompt.label || key,
        default: prompt.default,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true)
      }]).then(answers => {
        metaData[key] = answers[key]
        next()
      }).catch(next)
    }, done)
  }
}

const filterFiles = (filters) => {
  return (files, metalsmith, done) => {
    const metaData = metalsmith.metadata()
    if (!filters) {
      return done()
    }
    const fileNames = Object.keys(files)
    Object.keys(filters).forEach(glob => {
      fileNames.forEach(file => {
        if (match(file, glob, { dot: true })) {
          const condition = filters[glob]
          // TODO：取代new Function()定义函数
          // Function构造函数可以接收任意数量的参数，但最后一个参数始终都被
          // 看成是函数体，而前面的参数则枚举出了新函数（即最后一个参数）的参数。
          // 不推荐使用这种方法定义函数，因为这种语法会导致解析两次代码（第一次是解析常规ECMAScript代码,
          // 第二次是解析传入构造函数中的字符串）
          const evaluate = new Function('data', 'with (data) { return ' + condition + '}')
          if (!evaluate(condition, metaData)) {
            delete files[file]
          }
        }
      })
    })
    done()
  }
}

const renderTemplateFiles = () => {
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
