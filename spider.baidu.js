var baidu_base_url = 'http://tieba.baidu.com';
 
var http = require('http');
var url = require('url').parse(baidu_base_url + '/f?ie=utf-8&kw=%E5%A7%90%E8%84%B1');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var $ = require('jquery');
var _ = require('underscore');
var saveRoot = "c:\\nodejs\\meizi\\baidu-tieba\\"; //保存文件的根目录
var fs = require('fs');
//缺少c++ 64位支持
String.prototype.replaceAll = function(s1, s2) {
    var demo = this
    while (demo.indexOf(s1) != - 1)
    demo = demo.replace(s1, s2);
    return demo;
}
 
function htmlBufferget(Url, callback) {
    http.get(Url, function(res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            callback(bufferHelper.toBuffer());
        });
    });
}
 
//获取页面
function htmlget(Url, callback) {
    http.get(Url, function(res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            var html = iconv.decode(bufferHelper.toBuffer(), 'GBK');
            callback($(html));
        });
    });
}
 
// 获取帖子中的图片地址
function getTieZiImg(url, fold) {
    htmlget(url, function(html) {
        html.find('img.BDE_Image').each(function(i, el) {
            var $img = $(el);
            var imgUrl = $img.attr('src');
            htmlBufferget(imgUrl, function(buffer) {
                var fileName = fold + "/" + i + ".png";
                fs.writeFile(fileName, buffer, 'binary', function(err) {
                    if (err) throw err ;
                    console.log(fileName + '  File saved.');
                });
            });
        });
    });
}
 
//主方法
htmlget(url, function(html) {
    html.find('a.j_th_tit').each(function(i, el) {
        var $a = $(el);
        var tieziUrl = baidu_base_url + $a.attr("href");
        var foldID = $a.attr("href").toString().replaceAll("/p/", "");
        var title = $a.html();
        //目录中的特殊字符
        title = title.replaceAll("/", "");
        title = title.replaceAll("?", "");
        title = title.replaceAll(",", "");
        title = title.replaceAll(":", "");
 
        //使用闭包在for中模拟多个线程
        (function(tieziUrl, title, foldID) {
            _.delay(function() {
                var fold = saveRoot + title;
                var exists = fs.existsSync(fold);
                console.log(fold);
                if (!exists) {
                    console.log("不存在目录" + fold);
                    fs.mkdirSync(fold);
                    console.log("已创建" + fold);
                }
                getTieZiImg(tieziUrl, fold);
            },
            10);
        })(tieziUrl, title, foldID);
    });
});