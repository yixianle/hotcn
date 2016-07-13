var fs = require('fs');
var prompt = require('prompt');
var request = require('request');
var path = require('path');


// prompt 基础设置
prompt.message = 'grab-';
prompt.delimiter = '';
var prompt_item = [{
  description: '用户名: ',
  name: 'user',
  required: true
}, {
  description: '密码: ',
  name: 'pwd',
  hidden: true
}];

// 配置token 存放地址
var tokenFilePath = path.join(__dirname, '../.token');

var user = function(){}

// 登录 并 获取用户信息
user.getUser=function(params,callback) {
    //console.log(params)
    var token = null
    try {
        token = JSON.parse(fs.readFileSync(tokenFilePath, 'utf-8'));
    } catch(ex) {}
    if(token && token.timestamp){
        // 验证token 是否有效
        if(token.timestamp > new Date().getTime()){
            request({
                method: 'get',
                url: global.grab.baseUrl+global.grab.interface.getUser,
                headers: {
                    'Cookie': 'token='+token.value
                }
            }, function(err, resp, body) {
                if (!err && body) {
                    body = JSON.parse(body)
                    if(body.code==1 && body.data){
                        global.grab.token = token.value
                        callback && callback(null,body.data)
                        return
                    }
                }
                this.login(callback)
            }.bind(this));
            return
        }
    }
    this.login(callback)
    //return "2323232kk23kjl"
};

// 登录
user.login=function(callback){
    prompt.get(prompt_item, function(err, info) {

        //var loginUrl = 'http://localhost:3000/user/login';
        
        if(!info){
            process.exit()
        }
        request({
            method: 'get',
            url: global.grab.baseUrl+global.grab.interface.login,
            qs: {
                userName: info.user,
                pwd: info.pwd
            }
        }, function(err, resp, body) {
            if (!err && body) {
                body = JSON.parse(body)
                if(body.code==1){
                    var cookie = resp.headers['set-cookie']&&resp.headers['set-cookie'][0]
                    //console.log(cookie)
                    var cookieToken = require('cookie').parse(cookie)
                    //console.log(token)
                    var token = {
                        value: cookieToken.token,
                        timestamp: new Date(cookieToken.Expires).getTime()
                    }
                    try {
                        fs.writeFileSync(tokenFilePath, JSON.stringify(token), 'utf-8');
                        global.grab.token = token.value
                        console.log('用户信息验证成功, 开始下一步操作!');
                        callback && callback(null,body.data);
                        return
                    } catch (ex) {
                    }
                }
            }
            console.log('用户信息验证失败, 请稍后重试!');
            callback && callback("用户信息验证失败",null);
        });

    });
},

// 清楚token
user.clearToken=function(){
    try {
        fs.unlinkSync(tokenFilePath)
    } catch (ex) {
    }
}


module.exports = user;