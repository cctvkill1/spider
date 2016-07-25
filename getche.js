var http = require('http');
// var cheerio = require('cheerio');
var BufferHelper = require('bufferhelper');
var iconv = require('iconv-lite');
// var mysql = require('mysql');
var async = require('async');
process.on('uncaughtException', function (err) {
    //打印出错误
    console.log('global-e:',err);
    //打印出错误的调用栈方便调试
    console.log('e-stack:', err.stack);
});
// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'test'
// });
//connection.connect();
var global_i = 0;
get_html('http://i.che168.com/Handler/SaleCar/ScriptCarList_V1.ashx?needData=1', function (html) {
    //html = iconv.decode(bufferHelper.toBuffer(), 'gb2312');
    eval(html);
    if (typeof fct == 'undefined' || fct['0'].length == 0) { return; }
    var gblist = '', blist = '', bletter = 'A';
    var brandList = fct['0'].split(',');
    var brandName = '', brandId = '', brandZm = '';
    var brandListArr = [];
    for (var i = 0; i < brandList.length; i = i + 2) {
        var _obj = {};
        _obj.brandName = brandList[i + 1].substring(2);
        _obj.brandId = brandList[i];
        _obj.brandZm = brandList[i + 1].substring(0, 1);
        brandListArr.push(_obj);
        //console.log(brandId, brandZm, brandName);
    }
    //brandListArr.shift();
    //console.log(brandListArr); 
    async.eachSeries(brandListArr, function (obj, callback) {
        //if (obj.brandId != 36) {
        //    callback();
        //    return;
        //}
        if (typeof obj == 'undefined' || obj == null) {
            console.log('-------------------------1----------------------------');
            callback();
            return;
        }
        var get_class_html = 'http://i.che168.com/Handler/SaleCar/ScriptCarList_V1.ashx?seriesGroupType=2&needData=2&bid=' + obj.brandId;
        get_html(get_class_html, function (html) {
            eval(html);
            if (typeof br[obj.brandId] == 'undefined' || br[obj.brandId].length == 0) {
                return;
            }
            var slArray = br[obj.brandId].split(',');
            var gblist = '', blist = '', factoryname = '', seriessplit = '';
            factoryname = slArray[1].split(' ')[0];
            var factoryName = '';
            var classListArr = [];
            for (var i = 0; i < slArray.length; i += 2) {
                var _obj = {};
                seriessplit = slArray[i + 1].split(' ');
                factoryName = seriessplit[0];
                _obj.factoryName = seriessplit[0];
                seriessplit.shift();
                _obj.classId = slArray[i];
                _obj.className = seriessplit.join(' ');
                classListArr.push(_obj);
                
            }

            async.eachSeries(classListArr, function (cls, callback2) {
                get_html('http://i.che168.com/Handler/SaleCar/ScriptCarList_V1.ashx?seriesGroupType=2&needData=3&seriesid=' + cls.classId, function (html) {
                    var spcArray = eval(html);
                    for (var i = 0; i < spcArray.length; i++) {
                        var year = spcArray[i].year;
                        for (var j = 0; j < spcArray[i].spec.length; j++) {
                            var modelName = spcArray[i].spec[j].name;
                            var modelId = spcArray[i].spec[j].id;
                            console.log(global_i++);
                            console.log(obj.brandId, obj.brandZm, obj.brandName, cls.factoryName, cls.classId, cls.className, year, modelId, modelName);
                        }
                    }
                    callback2();
                });
            }, function (err) {
                if (typeof err == 'undefined' || err == null) {
                    callback();
                } else {
                    console.log('!get model error');
                }
            });
        }, function (err) {
            console.log('socked-err', err);
            callback();
        });
    }, function (err) {
        if (typeof err == 'undefined' || err == null) {
            console.log('finished');
        } else {
            console.log('!get class error');
        }
    });
    return;
});


//获取页面
function get_html(url, callback, errCallback) {
    http.get(url, function (res) {
        var bufferHelper = new BufferHelper();
        var html = '';
        res.on('data', function (chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function () {
            //console.log(url.substr(-5));
            html = iconv.decode(bufferHelper.toBuffer(), 'GBK');
            //console.log(html);
            callback(html);
        });
    }).on('error', function (e) {
        console.log('e1', e);
        errCallback(e);
    });
}

// connection.end();
