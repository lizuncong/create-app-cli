这是个创建项目的脚手架工具，目前只有一个可用的模版，测试模版lizuncong/testTemplate。后续会补充react项目模版

1.使用Node开发命令行工具所执行的js脚本必须
在顶部加入 #!/usr/bin/env node声明

2.在终端工具中执行脚本，需要 node bin/create-app init testTemplate ../test这样执行，
如果需要在终端工具中直接使用自定义的命令执行脚本，比如create-app init testTemplate ../test之类的
首先在package.json里面增加
"bin": {
    "create-app": "bin/create-app"
}，
最后要把create-app这个命令链接到全局，运行npm link即可链接到全局


npm发包
1.注册npm账号
2.在npm检索是否有重名的名字
3.将package.json中的name修改为发布到npm上的包名
这个包名和项目名称无关
4.打开控制台，执行npm login， 控制台登录npm
5.登录成功后，在项目下执行npm publish发布

如果发布失败，需要检查是否是npm源的问题
如果是淘宝的镜像源，需要切回npm的源
这里安装了一个插件nrm可以管理npm的镜像源
