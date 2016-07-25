var http = require("http");
var cheerio = require("cheerio");
var fs = require("fs"); 
var request = require('request');

var baseurl = "http://www.mzitu.com/"; 
var savePath = 'D:/test/node-mzitu/';  
var picKind = ["xinggan", "japan", "mm", "taiwan", "model"]  
var repr = /.+?\//gi;
var start = 1;
var end = 2;
var total = 1;

//获取页面
function get(url, callback) { 
  // var options = {
  //   url: url,
  //   headers: {
  //     'User-Agent': 'Mozilla 5.10'
  //   }
  // };
  // var req = request.get(options, function (res) {
  //   var data = "";
  //   res.on('data', function (chunk) {
  //     data += chunk;
  //   });
  //   res.on('end', function () { 
  //     callback(data);
  //   }).on("error", function() {
  //     callback(null);
  //   });
  // }); 
var options = {
  url: url,
  headers: {
    'User-Agent': 'Mozilla 5.10'
  }
};



request(options, function (error, response, body) {
  // if (!error && response.statusCode == 200) {
  //   var info = JSON.parse(body);
  //   console.log(info.stargazers_count + " Stars");
  //   console.log(info.forks_count + " Forks");
  // }

  // var info = JSON.parse(body);
  callback(body);
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
mkdir(savePath);
for (var i =0 ; i < picKind.length ; i++) {
  (function(picK) {
    for(var j=start;j<end;j++){
      var pageUrl = baseurl + picK + "/page/" + j;  
      get(pageUrl, function(data) { 
        console.log(pageUrl+'网页获取成功') 
        var $ = cheerio.load(data); 
        $('#pins>li>a').each(function() {
          var childUrl = $(this).attr("href");
          get(childUrl, function(cData) { 
            console.log(childUrl+'子网页获取成功')
            var $ = cheerio.load(cData);
            var src = $(".main-image img").attr('src');
            var srcArr_ = src.split('/')
            var filename_ = srcArr_[srcArr_.length-1].split('.')[0] 
            var _filename = src.replace(srcArr_[srcArr_.length-1],'')
            var ext = '.'+srcArr_[srcArr_.length-1].split('.')[1]
            var num = $(".dots").next().text();
            for (var x = 0; x <= num; x++) {               
              if (x < 10){
                _name = '0' + x
                name = filename_.substring(0,filename_.length-2) + _name 
              }else{             
                name = filename_.substring(0,filename_.length-2) + x
                picUrl = _filename+name+ext 
                var filename = savePath + name+ext ; 
                if(_filename!='') download(picUrl,filename)      
              }
          }
        })
}); 
});
}
})(picKind[i]);
}
console.timeEnd("耗时");