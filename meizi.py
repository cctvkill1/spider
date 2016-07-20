#!bin/python
#-*- coding: UTF-8 -*-


'''妹子图 spider
   URL: www.meizitu.com
   抓取网站所有图片
'''

import re
import string
import time
# import urllib, urllib2
import os
import sys
import multiprocessing
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2

count = 0

def getPageA(page, store_dir):
    print('第', page, '页开始抓取')
    '''获取每个模块下的图片链接'''
    image_items = {}
    url_index = 'http://www.meizitu.com/a/list_1_%s.html' % page
    prog_index = r'<h3 class="tit"><a href="(.*)".*</a></h3>'
    try:
        data = urllib2.urlopen(url_index).read()
        print('获取网页成功')

        data = data.decode('GBK')
        index_items = re.findall(prog_index, data)

        poolGetPic = multiprocessing.Pool(20)

        for index, item in enumerate(index_items):
            # image_items[index] = image_item
            poolGetPic.apply_async(getImageUrl, (item, store_dir))
            # getImageUrl(item, store_dir)
        poolGetPic.close()
        poolGetPic.join()

        # return image_items
    except Exception as e:
        print(e)
    finally:
        pass
   


def getImageUrl(item, store_dir):
    prog_pages = r'<img alt=.*src="(.*)" /><br />'
    # pool = multiprocessing.Pool(20)
    dataItem = urllib2.urlopen(item).read()
    global count
    print('获取图片链接成功')
    dataItem = dataItem.decode('GBK')
    image_item = re.findall(prog_pages, dataItem)
    print('正则匹配完成')
    for i, image in enumerate(image_item):
        img = image.split('http://pic.meizitu.com/wp-content/uploads/')
        picUrl = img[1].replace("/", "-")
        print(picUrl)
        store_file = store_dir + str(picUrl) + '.jpg'
        # pool.apply_async(downloadImage, (image, store_file))
        downloadImage(image, store_file)
        count += 1
    # pool.close()
    # pool.join()

def downloadImage(image, store_file):
    if not os.path.exists(store_file):
        print('----pic start download----')
        urllib2.urlretrieve(image, store_file, call_back)
    else:
        print('pic is exists')


def BeginDownload(page):
    page = int(page)
    store_dir = 'D:/test/meizitu_1/'

    if os.path.exists(store_dir):
        pass
    else:
        os.makedirs(store_dir)
        print('文件夹新建完成')

    getPageA(page, store_dir)
    # pool = multiprocessing.Pool(5)
    # for x in range(1,page+1):
    #     pool.apply_async(getPageA(x,store_dir))
    # pool.close()
    # pool.join()


def call_back(a, b, c):
    per = 100 * a * b / c
    if per < 100:
        sys.stdout.write('%.2f%%\r' % per)
        sys.stdout.flush()
    else:
        print ('----pic download finish!----')

if __name__ == '__main__':

    start_time = time.time()
    print ('''
             *************************************
             **       Welcome to use Spider     **
             **       Created on 2016-07-08     **
             **       Edit    on 2016-07-12     **
             **       @author: Jerry            **
             **       @editer: CCTV             **
             *************************************
          ''')

    page = '2'
    if '0' < page <= '88':
        BeginDownload(page)
        print ('All done!')
    elif page == 'all':
        for i in range(1, 89):
            BeginDownload(i)
            print ('Page %s done!' % i)
        print ('All done!')
    print (count, "张图片")
    print ("共耗时%.2fs" % (time.time() - start_time))
    sys.exit(-1)
    # 303.4秒240张 （异步下图）
    # 64.5秒240张 （异步分页）