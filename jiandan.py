#! /usr/bin/env python
# -*- coding: utf-8 -*-
 
'''抓取 jandan.net 上的无聊图或妹子图的url并保存文件,可过滤指定oo数以下的图片
by Conanca
'''
 
import  re
from bs4 import BeautifulSoup
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2
 
url_temp = 'http://jandan.net/{0}/page-{1}'
file_temp = '{0}_page{1}-{2}_like{3}.txt'
 
def set_proxy(proxy):
    ''' 设置代理服务器 '''
    urllib2.install_opener(urllib2.build_opener(urllib2.ProxyHandler({'http' : proxy})))
 
def pick_one_page(page_url,min_like,urls_file_name):
    ''' 获取指定页的指定oo数的图的地址列表 '''
    print ('Reading page:{0} ...'.format(page_url))
    html = urllib2.urlopen(page_url).read()
    soup = BeautifulSoup(html)
    comments = soup.findAll('li',id=re.compile('comment-.'))
    img_list = []
    print ('Picking picture ...')
    for comment in comments:
        soup = BeautifulSoup(str(comment))
        like = int(str(soup.find('span',id=re.compile('cos_support-.')).text))
        if like >= min_like:
            img = soup.find("img", "")
            if img:
                img_url = str(img['src'])
                print ('got one picture:{0}'.format(img_url))
                item = img_url,like
                img_list.append(item)
    save_img_urls(img_list,urls_file_name)
    return img_list
 
def pick_pages(column,start_page,end_page,min_like):
    ''' 获取指定范围页的指定oo数的图的地址列表 '''
    print ('Ready to pick {0} picture of page {1} to {2} (has at least {3} oo)'.format(column,start_page,end_page,min_like))
    urls_file_name = file_temp.format(column,start_page,end_page,min_like)
    img_list = []
    for i in range(start_page,end_page+1):
        page_url = url_temp.format(column,i)
        img_list.extend(pick_one_page(page_url,min_like,urls_file_name))
    print ('Got {0} pictures.'.format(len(img_list)))
    return img_list
 
def save_img_urls(img_list,file_path):
    ''' 保存图片Url至指定文件 '''
    print ('Saving URLs...')
    with open(file_path,'a') as f:
        f.writelines(item[0]+'\n' for item in img_list)
 
if __name__ == '__main__':
    #set_proxy('http://192.168.2.61:8080')    # 可以设置代理,以防止本地ip被ban
    column = str(raw_input('Please select pic or ooxx: '))
    start_page = int(raw_input('Please input start page: '))
    end_page = int(raw_input('Please input end page: '))
    min_like = int(raw_input('Please input minimal like(oo),0 for no limit: '))
    img_list = pick_pages(column,start_page,end_page,min_like)