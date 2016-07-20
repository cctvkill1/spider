from threading import Thread
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2
import time
import re
 
def showId(_id):
    time.sleep(1)
    print(_id)
   
threads = []
nb_threads = 800

max_id = 945718
for i in range(nb_threads):
    id_range = range(i*max_id//nb_threads+1, (i+1)*max_id//nb_threads )
    thread = Thread(target=showId, args=(id_range,))
    threads.append(thread)
    thread.start()
# print(threads)
for thread in threads:
    thread.join()  