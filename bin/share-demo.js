const readline = require('readline')

console.log('process.argv...', process.argv)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('请输入项目名称:\n', (answer) => {
  console.log(`你输入的项目名称为：${answer}`)
  rl.close()
})

rl.question('请输入项目作者:\n', (answer) => {
  console.log(`你输入的项目作者为：${answer}`)
  rl.close()
})
