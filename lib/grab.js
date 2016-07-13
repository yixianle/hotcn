var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var _ = require('lodash');

var exec = require('child_process').exec;


module.exports = grab;


function grab(params) { }

var initData={
  data:{},
  siteDefault:{
    "domain" : "www.channelnewsasia.com",
    "domainUrl": "http://www.channelnewsasia.com/",
    "type" : 1,
    "language" : "en",
    "isAsync" : false,
    "isCn" : false,
    "isHttps" : true,
    "siteNameCn" : "亚洲新闻网",
    "siteName" : "Channel NewsAsia",
    "titleSelector" : "#content .text-area .news_title",
    "introSelector" : "#content .text-area .news_brief",
    "postTimeSelector" : "#content .text-area .news_posttime",
    "contentSelector" : "#content .info-area .news_detail",
    "casperWaitSelector" : "#content .info-area .news_detail",
    "authorSelector": "#content .text-area .stories-byline-link",
    "classify": [1,11],
    "classifyName": ['新闻','亚太地区'],
    "listUrl": 'http://www.channelnewsasia.com/archives/4760/Asia%20Pacific/months/latest/',
    "total": 20 // 抓取总数 
  },
  // 类别
  classify:[
    {
      classify: [1101,110101],
      classifyName: ['新闻','亚太'],
      listUrl: 'http://www.channelnewsasia.com/archives/4760/Asia%20Pacific/months/latest/',
      total: 20 // 抓取总数 
    },
    {
      classify: [1101,110102],
      classifyName: ['新闻','全球'],
      listUrl: 'http://www.channelnewsasia.com/archives/3032/World/months/latest/',
      total: 20
    },
    {
      classify: [1101,110103],
      classifyName: ['新闻','科技'],
      listUrl: 'http://www.channelnewsasia.com/archives/4616/Technology/months/latest/',
      total: 10
    },
    {
      classify: [1101,110104],
      classifyName: ['新闻','商业'],
      listUrl: 'http://www.channelnewsasia.com/archives/4848/International%20Business/months/latest/',
      total: 10
    },
    {
      classify: [1101,110105],
      classifyName: ['新闻','娱乐'],
      listUrl: 'http://www.channelnewsasia.com/archives/3640/Entertainment/months/latest/',
      total: 10
    },
    {
      classify: [1101,110106],
      classifyName: ['新闻','运动'],
      listUrl: 'http://www.channelnewsasia.com/archives/4650/Sport/months/latest/',
      total: 10
    },
    {
      classify: [1101,110107],
      classifyName: ['新闻','健康'],
      listUrl: 'http://www.channelnewsasia.com/archives/4772/Health/months/latest/',
      total: 10
    },
    {
      classify: [1101,110108],
      classifyName: ['新闻','生活'],
      listUrl: 'http://www.channelnewsasia.com/archives/4810/Lifestyle/months/latest/',
      total: 10
    }
  ],
  urlList:[],
  currentPage: 0,
  translateIndex: 1  //计数
}

//main()
//allClassify()
grab.start = function() {
  allClassify()
}

function main(callback) {
  // 获取 url 列表
  initData.currentPage = 0
  initData.urlList = []
  getUrlList(function() {
    // 解析 保存 列表信息
    parseUrlList(function() {
      console.log("当前分类处理完成")
      callback && callback()
    })
    
  })
}

// 控制分类抓取
function allClassify() {
  console.log(" =========== 获取分类url信息 =========== ")
  if(initData.classify.length>0){
    _.assign(initData.siteDefault ,initData.classify[0])
    initData.classify.splice(0,1)
    main(allClassify)
  }else{
    console.log("all over!")
    process.exit()
  }
  
}

// 获取 detail 页 url列表
function getUrlList(callback) {
  console.log("request get detailList begin")
  request( initData.siteDefault.listUrl +initData.currentPage, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      initData.currentPage ++;
      console.log("request get detailList success") // 列表页抓取成功
      var $ = cheerio.load(body)
      
      $("#newsArchivesForm .archive-section li .holder").each(function (idx, element) {
        var $element = $(element);
        
        var urlInfo = {
            url: url.resolve(initData.siteDefault.domainUrl,$element.find(".txt-box h2 a").attr('href')),
            title: $element.find(".txt-box h2 a").text(),
            img: url.resolve(initData.siteDefault.domainUrl,$element.find(".img img.pdd-items").attr('src')),
            intro: $element.find(".txt-box p").text()
        }
        //console.log(urlInfo)
        initData.urlList.push(urlInfo);
      });
      if(initData.urlList.length<initData.siteDefault.total){
        getUrlList(callback)
      }else{
        callback && callback()
      }
      
    }
  })
}

// 解析下一条记录
function parseNextRecord(isNext,callback) {
  if(isNext){
    //initData.urlList.splice(0,1)
    initData.urlList.pop()
  }
  if(initData.urlList.length>0){
    parseUrlList(callback)
  }else{
    callback && callback()
  }
  
}

// 逐一处理url列表
function parseUrlList(callback) {

  var urlObj = initData.urlList[initData.urlList.length-1]
  //urlObj.url = 'http://www.channelnewsasia.com/news/asiapacific/cambodian-pm-hun-sen-s/2936090.html'
  //initData.urlList.splice(0,1)
  if(!urlObj.url){
    console.log("----------- 解析下一条记录 -----------")
    parseNextRecord(true,callback)
    return
  }
  
  console.log("----------- 验证url是否存在 -----------")
  // 验证url 是否存在
  myAjax( {
    url:global.grab.baseUrl+global.grab.interface.getOriginByUrl,
    data:{
      url:urlObj.url
    }
  } , function (body) {

    // console.log(body)
    // console.log(body.code)
    
    if(body.code==1){
      
      if(body.data){
        console.log("此url已存在")
        console.log("----------- 解析下一条记录 -----------")
        parseNextRecord(true,callback)
        return
      }
      
      console.log(urlObj.url,"request url detail begin")
      // 请求详情页
      request( urlObj.url , function (error, response, body) {
        //console.log(arguments,33311)
        if (!body.data) {
          console.log("request url detail success")
          var $ = cheerio.load(body)
          var firstPic = $("#photo-tab .main-slide img.pdd-items").attr("src")
          var postInfo = JSON.parse( JSON.stringify(initData.siteDefault) )

          //获取发布时间
          var postedTime = $("#content .text-area .news_posttime").text()
          postedTime = postedTime.substring(7)
          postedTime = postedTime?new Date(postedTime):new Date()
          if(postedTime=="Invalid Date"){
            postedTime = new Date()
          }

          _.assign(postInfo,{
            url: urlObj.url,
            title: $("#content .text-area .news_title").text(),
            intro: urlObj.intro, // 简介
            thumbnail: urlObj.img, // 缩略图
            firstPic: firstPic ? url.resolve(postInfo.domainUrl ,firstPic):null,
            //html: body,
            bodyDom: $("#content .info-area .news_detail").html(),
            bodyStr: $("#content .info-area .news_detail").text(),
            type: 1, // 网站结构类型
            parseStatus: 1, // 
            translateStatus: 0,
            postedTime: postedTime,
            views: 1
          })

          translate(postInfo,callback)

        }else{
          // 获取失败
        }
      })
      
    }
  })
  
  
}

// 翻译
function translate(articleInfo,callback) {
  
  
    if(articleInfo){
      console.log("翻译总文章数: "+initData.translateIndex)
      initData.translateIndex++
      console.log("开始翻译")
      var params = articleInfo.casperWaitSelector ? (articleInfo.url+' "'+articleInfo.casperWaitSelector+'"'):articleInfo.url
      console.log(params,"----casperjs  google translate-----")
      var child = exec('casperjs '+path.resolve(__dirname,'./google.js')+' '+params,{maxBuffer: 2 * 1024 * 1024 }, function(error, stdout, stderr) {
        child.kill()
        if (error) {
          console.log(error.stack);
          console.log('Error code: ' + error.code);
          callback && callback(error)
        }else if(stderr) {
          console.log(stderr.stack);
          console.log('Error code: ' + error.code);
          console.log(stderr)
        }else{
          var resultObj = JSON.parse(stdout)
          console.log('Child Process STDOUT: success',"----casperjs  google translate-----");
          
          $ = cheerio.load(resultObj.html);
          $(".google-src-text").remove()
          $("span.notranslate").removeAttr('onmouseover').removeAttr("onmouseout").removeClass("notranslate")
          $("a").removeAttr('href')
          
          $("img").map(function(index, item) {
            return $(this).attr('src',articleInfo.domainUrl + $(this).attr('src'))
          })
          
          _.assign(articleInfo,{
            titleCn: articleInfo.titleSelector && $(articleInfo.titleSelector).text(), // 中文标题
            introCn: articleInfo.introSelector && $(articleInfo.introSelector).text(), // 中文简介
            //authorCn: articleInfo.authorSelector && $(articleInfo.authorSelector).text(), // 作者中文名
            translateStatus: 1, // 
            translateUrl: resultObj.url, // google 翻译地址 
            //htmlCn: $.html(), // 中文网页
            bodyDomCn: articleInfo.contentSelector && $(articleInfo.contentSelector).html(), // 中文主体节点
            bodyStrCn: articleInfo.contentSelector && $(articleInfo.contentSelector).text(), // 中文主体字符串
            audit: 0, //审核状态,
            updateTime: new Date()
          })
          
          //console.log(articleInfo)
          console.log("----------- 保存文章数据 -----------")
          console.log("request data length:" + JSON.stringify(articleInfo).length)
          myAjax( {
            url:global.grab.baseUrl+global.grab.interface.saveData,
            method: "post",
            data: articleInfo
          } , function (body) {
            console.log("save Result:"+ JSON.stringify(body))
            if(body && body.code==1){
              console.log("----------- 解析下一条记录 -----------")
              parseNextRecord(true,callback)
            }
          })
        }
      });
    }
}

function myAjax(data,callback){
  request({
    url: data.url,
    method: data.method || 'get',
    qs: data.method == "post" ? null : data.data,
    form: data.method == "post" ? data.data : null,
    headers: {
      'Cookie': 'token='+global.grab.token
    }
  }, function(error, response, body) {
    if(!error){
      callback( JSON.parse(body) )
    }else{
      console.log(error)
    }
  })
}