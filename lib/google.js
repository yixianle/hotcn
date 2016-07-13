var casper = require("casper").create({
		pageSettings: {
			loadImages: false, // The WebPage instance used by Casper will
			loadPlugins: false // use these settings
		},
		logLevel: "error", // Only "info" level messages will be logged
		verbose: true
	}) //新建一个页面


var translate = 'https://translate.google.com.hk/translate?act=url&hl=zh-CN&ie=UTF8&prev=_t&sl=en&tl=zh-CN&u=';

var url = casper.cli.args && casper.cli.args[0]
url = translate + url
// console.log('url:' + url)

casper.start(url, function() {

	//this.echo('Page url is iframe 0');
});



casper.withFrame('c', function() {
	
	this.wait(1000, function() {
		
		this.waitForSelector(casper.cli.args && casper.cli.args[1] || 'body', function() { //等到'.tweet-row'选择器匹配的元素出现时再执行回调函数
			
			
			this.echo(JSON.stringify({
				url: this.getCurrentUrl(),
				html: this.getHTML()
			}))
		}, function() {
			this.echo('Page url is iframe 1113');
			this.die('Timeout reached. Fail whale?').exit(); //失败时调用的函数,输出一个消息,并退出
		}, 60 * 1000); //超时时间,指定的选择器还没出现,就算失败 
    });
	
});

casper.run();