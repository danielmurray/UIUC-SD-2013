from ws import BackboneCollection
from BeautifulSoup import BeautifulSoup
import re, time, gevent, urllib2
import xml.etree.ElementTree as ET

class PowerController(BackboneCollection):

  def __init__(self):
    self.ws = None # make the websocket connection + send auth
    self.freq = 60 #in seconds
    BackboneCollection.__init__(self)
    gevent.spawn(self._data_fetch)

  def _data_fetch(self):
    while(1):
      self.data_fetch()
      time.sleep(self.freq)


  def data_fetch(self):
    print "FETCHING E-GAUGE DATA"
    latest_data = self.parse_xml(self.fetch_data())
    self.update_client(latest_data)

  def update_client(self, data_dict):
    for k,v in data_dict.items():
      self.update(v)

  def fetch_data(self):
    server_url = "http://128.174.180.40/cgi-bin/egauge?tot"
    return self.make_request(server_url, None)

  def parse_xml(self,unparsed_xml):
    xml_tree = ET.XML(unparsed_xml)
    energy_dict = {}
    for each in xml_tree.iter('meter'):
      key = each.attrib['title']
      energy =  each.find('energy').text
      energyWs = each.find('energyWs').text
      power = each.find('power').text

      energy_dict[key] = {
        'id':key,
        'energy':energy,
        'energyWs':energyWs,
        'power':power
      }
    return energy_dict

  def make_request(self,url, data):
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    return response.read()

