const async = require('async')
const inquirer = require('inquirer')
const evaluate = require('./eval')

// Support types from prompt-for which was used before
const promptMapping = {
  string: 'input',
  boolean: 'confirm'
}

/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

module.exports = function ask (prompts, data, done) {
  // async.eachSeries(coll, iteratee, callback)
  // iteratee是个异步函数(key, callback) => {}，iteratee执行完必须要调用callback
  // 当所有的iteratee执行完成或者有错误发生时，调用callback，即ask的done回调。
  async.eachSeries(Object.keys(prompts), (key, next) => {
    prompt(data, key, prompts[key], next)
  }, done)
}

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function prompt (data, key, prompt, done) {
  // skip prompts whose when condition is not met
  // if (prompt.when && !evaluate(prompt.when, data)) {
  //   return done()
  // }

  // let promptDefault = prompt.default
  // if (typeof prompt.default === 'function') {
  //   promptDefault = function () {
  //     return prompt.default.bind(this)(data)
  //   }
  // }

  inquirer.prompt([{
    type: prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: prompt.default,
    choices: prompt.choices || [],
    validate: prompt.validate || (() => true)
  }]).then(answers => {
    // if (Array.isArray(answers[key])) {
    //   data[key] = {}
    //   answers[key].forEach(multiChoiceAnswer => {
    //     data[key][multiChoiceAnswer] = true
    //   })
    // } else if (typeof answers[key] === 'string') {
    //   data[key] = answers[key].replace(/"/g, '\\"')
    // } else {
      data[key] = answers[key]
    // }
    done()
  }).catch(done)
}
