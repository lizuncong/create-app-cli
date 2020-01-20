const chalk = require('chalk')
const format = require('util').format


const prefix = '   create-app-cli'
const sep = chalk.red('·')

// args：参数数组
exports.fatal = function (...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim()
  // 巧妙运用apply接收参数数组的特性，如果直接调用format(args)输出的就是个数组
  const msg = format.apply(format, args)
  console.error(chalk.red(prefix), sep, msg)
  process.exit(1)
}
