const async = require('async')
const inquirer = require('inquirer')


// 交互，获取用户输入
module.exports = function ask (prompts, data, done) {
  // async.eachSeries(coll, iteratee, callback)
  // iteratee是个异步函数(key, callback) => {}，iteratee执行完必须要调用callback
  // 当所有的iteratee执行完成或者有错误发生时，调用callback，即ask的done回调。
  async.eachSeries(Object.keys(prompts), (key, next) => {
    prompt(data, key, prompts[key], next)
  }, done)
}

function prompt (data, key, prompt, done) {

  inquirer.prompt([{
    type: prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: prompt.default,
    choices: prompt.choices || [],
    validate: prompt.validate || (() => true)
  }]).then(answers => {
    data[key] = answers[key]
    done()
  }).catch(done)
}
