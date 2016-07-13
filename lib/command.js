
var commander = require('commander'); //cli 命令工具
var request = require('request');

var user = require('./user.js'); //用户信息
var grab = require('./grab.js'); 

var config = require('../config.js'); 

global.grab = {}

// 绑定命令
commander.command('start')
  .description('获取数据 提交服务器')
  .option('-o, --online', '线上环境')
  .option('-p, --port [value]', '服务端监听端口')
  .action(function(env){
    setConfig(env.online,env.port)
    
    user.getUser({},function(err,user) {
      if(!err && user){
        console.log("当前登录用户："+user)
        env.online?console.log("数据提交至线上环境"):console.log("数据提交至本地环境")
        
        console.log("开始抓取数据！")
        grab.start()
      }
        
    })
    
  });

// 登录
commander.command('login')
  .description('登录')
  .option('-o, --online', '线上环境')
  .option('-p, --port [value]', '服务端监听端口')
  .action(function(env){
    setConfig(env.online,env.port)
    
    user.getUser({},function(err,user) {
        console.log(user)

    })
    
  });


// 退出
commander.command('logout')
  .description('退出登录')
  .action(function(env){
    //console.log(env)
    var token = user.clearToken()
  });

// 系统配置
function setConfig(online,port) {
  global.grab.interface = config.interface
  if(online){
    global.grab.baseUrl = config.online.baseUrl
  }else{
    global.grab.baseUrl = config.local.baseUrl
  }
  global.grab.baseUrl= port?global.grab.baseUrl+":"+port:global.grab.baseUrl
}


console.log("========begin=========")

// 解析参数
commander.parse(process.argv);
commander.args.length || commander.help();
