# -*- coding: utf-8 -*-
""" 
http://www.mzitu.com/ 妹子图
多进程异步 爬取子页面链接 和 多线程下载
by cctv
"""
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2
import sys
import time
import string
import os
import re
import random
from multiprocessing.dummy import Pool as ThreadPool
from threading import Thread


def download_pic(url):
    global count
    global dir_name
    global time_out
    try:
        if(count>1000):
            sys.exit(-1) 
        content = urllib2.urlopen(url,timeout = time_out)
        url_content = content.read()
        file_name = dir_name+url.split('/')[-1]
        f = open(file_name, "wb")
        f.write(url_content)
        f.close()
        print('----',url,'下载完成----')
        count += 1
        # if os.path.getsize(file_name) >= 1024 * 11:
        #     count += 1
        # else:
        #     os.remove(file_name)
    except Exception as e:
        print (e)
        # download_pic(url)

def download_pics(urls):
    for url in urls:
        download_pic(url)
def get_list(url):
    global link_list
    global headers
    global time_out
    prog_index = re.compile('<li><a href=\"(.*?)\" target=\"_blank\">')
    try: 
        req  = urllib2.Request(url = url,headers = headers)
        data = urllib2.urlopen(req, timeout = time_out).read()  
        data = data.decode('utf-8')
        print('获取网页成功', url)
        index_items = re.findall(prog_index, data)
        for i in index_items:
            link_list.append(i)
    except Exception as e:
        print (e)


def get_pic(url):
    global pic_list
    global headers
    global time_out
    prog_pic = r'<div class=\"main-image\">.*?src=\"(.*?)\".*?'
    # prog_page=re.compile('<div class=\"pagenavi\">.*?<span>(.*?)</span>')
    # prog_page = r'<div class=\"pagenavi\">.*?<span class=\'dots\'>.*?</span>.*?<span>(.*?)</span>'
    prog_page = r'<span class=\'dots\'>.*?</span>.*?<span>(.*?)</span>'

    try: 
        req  = urllib2.Request(url = url,headers = headers)
        data = urllib2.urlopen(req, timeout = time_out).read()  
        data = data.decode('utf-8')
        # print(data)
        print('获取网页成功', url)
        total_pages = re.findall(prog_page, data)[0]
        pic = re.findall(prog_pic, data)[0]
        file_name = pic.split('/')[-1].split('.')[0]
        ext = '.'+pic.split('/')[-1].split('.')[1]
        _file_name = pic.replace(pic.split('/')[-1],'')
        total_pages = int(total_pages)
        test = []
        for x in range(1, total_pages + 1):
            if x < 10:
                _name = '0' + str(x)
                name = file_name[0: len(file_name) - 2] + _name 
            else:                
                name = file_name[0: len(file_name) - 2] + str(x)
            pic_url = _file_name+name+ext
            pic_list.append(pic_url)      
            # 第二种
            # download_pic(pic_url)
            # 第三种           
            test.append(pic_url)  

        threads = []
        page_size = 5  
        length = len(test)
        num = int(length/page_size)
        for x in range(num):
            # print(test[x*page_size:(x+1)*page_size+1])            
            thread = Thread(target=download_pics, args=(test[x*page_size:(x+1)*page_size+1],))
            threads.append(thread)
            thread.start() 
        # print(test[(x+1)*page_size:length-(x+1)*page_size-1])
        thread = Thread(target=download_pics, args=(test[(x+1)*page_size:length-(x+1)*page_size-1],))
        threads.append(thread)
        thread.start()  
        for thread in threads:
            thread.join()   
    except Exception as e:
        print (e)
        # get_pic(url)


if __name__ == '__main__':
    MAX        = 1
    count      = 0
    time_out   = 60
    thread_num = 30
    headers    = {"User-Agent": " Mozilla/5.0 (Windows NT 10.0; rv:39.0) Gecko/20100101 Firefox/39.0"}
    pic_list   = []
    page_list  = []
    link_list  = []
    pic_kind   = ["xinggan", 'share', "japan", "mm", "taiwan", "model"]
    dir_name   = "D:/test/mzitu/"   
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)
        os.chdir(dir_name)
    start_time = time.time()
    url_address = "http://www.mzitu.com/" 
    try:
        page_pool = ThreadPool(thread_num)
        for pic_i in pic_kind:
            for i in range(1, MAX + 1):
                url = url_address + pic_i + "/page/" + str(i)
                page_list.append(url)
        page_pool.map_async(get_list, (page_list))
        page_pool.close()
        page_pool.join()
        print ("获取到", len(link_list), "子网页链接，开始爬取！") 

        pool = ThreadPool(thread_num)
        pool.map_async(get_pic, (link_list))
        pool.close()
        pool.join()

        # 3种方式 异步抓到图就下 或者异步抓到图存到数组 然后再异步下载
        # 第一种
        # print ("获取到", len(pic_list), "张图片，开始下载！") 
        # pooldown = ThreadPool(thread_num)
        # pooldown.map_async(download_pic, (pic_list))
        # pooldown.close()
        # pooldown.join()

        # 测了几次  都是下1000张
        # 一起爬 27s，26s, 26s
        # 一个个爬 20s，18s，19s


        print (count, "张图片保存在" + dir_name)
        print ("共耗时",  time.time() - start_time, "s")
    except Exception as e:
        print (e)
        print ("maxium i=",  i)
