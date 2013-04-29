from ws import BackboneCollection
from BeautifulSoup import BeautifulSoup
import re, time, gevent, urllib2
import xml.etree.ElementTree as ET

class PowerController(BackboneCollection):
  typ = "power"
  ignored_power_meters = ["Total Usage", "Total Generation", "Solar+"]
  def __init__(self):
    self.ws = None # make the websocket connection + send auth
    self.freq = 3 #in seconds
    BackboneCollection.__init__(self)
    gevent.spawn(self._data_fetch)

  def _data_fetch(self):
    while(1):
      self.data_fetch()
      time.sleep(self.freq)


  def data_fetch(self):
    print "POWER::FETCHING E-GAUGE DATA"
    latest_data = self.parse_xml(self.fetch_data())
    self.update_client(latest_data)

  def update_client(self, data_dict):
    for k,v in data_dict.items():
      self.update(v)

  def fetch_data(self):
    server_url = "http://128.174.180.40/cgi-bin/egauge" # + "?tot"
    return self.make_request(server_url, None)

  def parse_xml(self,unparsed_xml):
    xml_tree = ET.XML(unparsed_xml)
    energy_dict = {}
    for each in xml_tree.iter('meter'):
      key = each.attrib['title']
      if key in self.ignored_power_meters:
        continue
      
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

class PVController(BackboneCollection):
  typ = "pv"
  def __init__(self):
    self.ws = None # make the websocket connection + send auth
    self.freq = 3 #in seconds
    BackboneCollection.__init__(self)
    gevent.spawn(self._data_fetch)

  def _data_fetch(self):
    while(1):
      self.data_fetch()
      time.sleep(self.freq)


  def data_fetch(self):
    print "PV::FETCHING APS DATA"
    latest_data = self.parse_aps_data()
    self.update_client(latest_data)

  def update_client(self, data_dict):
    for k,v in data_dict.items():
      self.update(v)

  def getVal(self,i):
    s = i.string if i.string else ''
    a = re.findall(r'\d+',s)
    return a[0] if len(a) > 0 else 0

  def parse_aps_data(self):
    html = BeautifulSoup(self.make_request('http://solardecathlon.web.cs.illinois.edu/APS-ECU/parameters.php',None))
    table = html.findAll('table')[0]
    panels = {}
    rows = table.tbody('tr')
    rows.pop(0)
    for row in rows:
      tds = row('td')
      panels[self.getVal(tds[0])] = {
        'id':self.getVal(tds[0]),
        'power':self.getVal(tds[1]),
        'fq':self.getVal(tds[2]),
        'voltage':self.getVal(tds[3]),
        'temp':self.getVal(tds[4]),
        'date':self.getVal(tds[5])
      }
    return panels

  def make_request(self,url, data):
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    return response.read()