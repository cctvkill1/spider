var http = require("http");
var cheerio = require("cheerio");
var fs = require("fs");

// var baseurl = "http://dbmeizi.com/?p={1}";//全部
var baseurl = ["http://dbmeizi.com/category/1?p={1}",//性感
               "http://dbmeizi.com/category/2?p={1}",//有沟
               "http://dbmeizi.com/category/3?p={1}",//美腿
               "http://dbmeizi.com/category/11?p={1}",//小清新
               "http://dbmeizi.com/category/12?p={1}",//文艺
               "http://dbmeizi.com/category/14?p={1}",//美臀
               ];
               var savePath = ["c:\\nodejs\\meizi\\dbmeizi\\性感\\",
               "c:\\nodejs\\meizi\\dbmeizi\\有沟\\",
               "c:\\nodejs\\meizi\\dbmeizi\\美腿\\",
               "c:\\nodejs\\meizi\\dbmeizi\\小清新\\",
               "c:\\nodejs\\meizi\\dbmeizi\\文艺\\",
               "c:\\nodejs\\meizi\\dbmeizi\\美臀\\",];
// var arr = {};
var repr = /.+?\//gi;
var start = 1;
var end = 1000;
var total = 1;

//获取页面
function get(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}
//下载图片
function download(imageurl,filename){
  http.get(imageurl,function(res) {
    var file = fs.createWriteStream(filename);  
    res.on('data', function(data) {
      file.write(data)     
    })
    res.on('end', function() {
      file.end();
      console.log("第%d张,保存成功:%s",total++,filename);
    })
  }).on('error', function(e) {
    console.error('error',e)
  })
}
//检测路径
function mkdir(path, callback){
  fs.exists(path,function(exists){
    if(!exists){
      // console.log(path + ' 不存在。');
      fs.mkdir(path, 0776, callback);
    }
    else{
      // console.log(path + ' 存在。');
    }
  });
}

console.time("耗时");
for (var i =0 ; i <baseurl.length ; i++) {
  // var pic ={
  //   'baseurl':baseurl[i],
  //   'savePath':savePath[i]
  // }; 
  // arr[i] = pic;
  mkdir(savePath[i]);
  (function(savePath) {
    for(var j=start;j<end;j++){
      var pageUrl = baseurl[i].replace("{1}",j)
      get(pageUrl, function(data) {
        if (data) {
          var $ = cheerio.load(data);
          $("img").each(function() {
            var imageUrl = $(this).attr("src");
            var filename = savePath + imageUrl.replace(repr,"").replace(/[\s\*\?\\\/:<>|]/g,"x"); 
            if(filename!='') download(imageUrl,filename) 
          // console.log($(this).attr("src"))
      });
        }
      });
    }
  })(savePath[i]);
}
console.timeEnd("耗时");

