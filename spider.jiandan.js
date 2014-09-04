//下妹子图node.js版本
var http = require('http')
var url = require('url')
var fs = require('fs')
// var baseurl = "http://www.dbmeizi.com/category/1?p=1{1}"

var baseurl = "http://jandan.net/ooxx/page-{1}"
var start = 800
var end = 1000
var repr1 = /<ol class="commentlist".*<\/ol>/gi
var repr2 = /<p><img src="(.+?)"/gi
var repr3 = /.+?\//gi
var savePath = "c:\\nodejs\\meizi\\jandan\\"; //保存文件的根目录

function getPages(){
    mkdir(savePath);
    for(var i=start;i<end;i++){
        var pageUrl = baseurl.replace("{1}",i)
        getImagePages(pageUrl,function(imageUrls){
            imageUrls.forEach(function(imageUrl){
                //剔除文件名特殊字符
                var filename = savePath + imageUrl.replace(repr3,"").replace(/[\s\*\?\\\/:<>|]/g,"x")
                if(filename!='') urlretrieve(imageUrl,filename) 
            })
        })
    }
}

function mkdir(path, callback){
    fs.exists(path,function(exists){
        if(!exists){
            console.log(path + ' 不存在。');
            fs.mkdir(path, 0776, callback);
            // callback(path);
        }
        else{
            console.log(path + ' 存在。');
            // var newName = renameSync(path);
            // existsAsyncRecursive(newName, callback);
        }
    });
}
function getImagePages(pageUrl,callback){

    var header={'User-Agent:' : 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.62 Safari/537.36'}
    var options = {
      host: url.parse(pageUrl).host,
      path: url.parse(pageUrl).pathname,
      method: 'GET',
      headers : header
  }
  var imageUrls = []
  http.get(options,function(res) {
    res.setEncoding('utf8');
    var html = ''
    res.on('data', function(chunk) { 
        html += chunk
    }) 
    res.on('end',function(){
        html = html.replace(/\s/g," ")

        var commentlist = html.match(repr1)
        commentlist.forEach(function(elem){
                //循环查找，进行分组
                while(group = repr2.exec(elem)) {   
                    imageUrls.push(group[1])
                } 
            })
        callback(imageUrls)
    })
}).on('error', function(e) {
    console.error('err',e)
})

}
function urlretrieve(imageurl,filename){

    http.get({ 
        host: url.parse(imageurl).host,
        path: url.parse(imageurl).pathname
    },function(res) {
        var file = fs.createWriteStream(filename);  
        res.on('data', function(chunk) { 
            file.write(chunk)     
        })
        res.on('end', function() {
            file.end()
            console.log("save file success:",imageurl)
        })
    }).on('error', function(e) {
        console.error('error',e)
    })
}

getPages()