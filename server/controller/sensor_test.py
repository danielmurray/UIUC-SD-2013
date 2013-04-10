import urllib2
import sys
import time


def start_testing(server_add):
	global server_add = server_add
	while(1):
		make_request(sensor_data_url,none)
		time.sleep(3)

def make_sensor_url(mac, typ, val):
	global server_add
	return server_add+'/sensor/data?mac_address='+mac+'&type='+typ+'&value='+val


def make_request(url, data):
	req = urllib2.Request(url, data)
	response = urllib2.urlopen(req)
	return response.read()


if len(sys.argv) < 2:
	print "pass in the server address as the first argument"
else:
	start_testing(sys.argv[1])