import urllib2
import sys
import time
from sensor_dict import *
import random

def start_testing(server_add):
	global _server_add
	_server_add = server_add
	#iterate through each of the sensors in the dict and mock test it to random value
	for key, each in sensor_list.items():
		print each
		print "======="
		print make_sensor_url(each['mac_address'], each['type'], random.randint(0,50))
		print "======="
	while(1):
		mac_add = raw_input("mac_add:")
		typ = raw_input("type:")
		val = raw_input("val:")
		print "======="
		print make_sensor_url(mac_add, typ, val)
		print "======="

def make_sensor_url(mac, typ, val):
	global _server_add
	url = _server_add+'/sensor/data?mac_address='+str(mac)+'&type='+str(typ)+'&value='+str(val)
	return make_request(url, None)


def make_request(url, data):
	req = urllib2.Request(url, data)
	response = urllib2.urlopen(req)
	return response.read()


if len(sys.argv) < 2:
	print "pass in the server address as the first argument"
else:
	start_testing(sys.argv[1])