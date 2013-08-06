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
    xml = self.fetch_data()
    if xml == '':
      print"eGauge: No power data"
      return {}
    latest_data = self.parse_xml(xml)
    self.update_client(latest_data)

  def update_client(self, data_dict):
    for k,v in data_dict.items():
      self.update(v)

  def fetch_data(self):
    server_url = "http://solardecathlon.web.cs.illinois.edu/egauge" # + "?tot"
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
    html = ''
    try: 
      response = urllib2.urlopen(req)
      return response.read()
    except urllib2.HTTPError, e:
      print('eGauge: HTTPError = ' + str(e.code))
    except urllib2.URLError, e:
      print('eGauge: URLError = ' + str(e.reason))
    except httplib.HTTPException, e:
      print('eGauge: HTTPException')
    except Exception:
      print('eGauge: urllib2 generic exception')
    return ''

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
    html = BeautifulSoup(self.make_request('http://192.168.1.102/cgi-bin/parameters',None))
    tables = html.findAll('table')
    if len(tables) == 0:
      print "APS: No data table found"
      return {}
    table = tables[0]
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
    html = ''
    try: 
      response = urllib2.urlopen(req)
      return response.read()
    except urllib2.HTTPError, e:
      print('APS: HTTPError = ' + str(e.code))
    except urllib2.URLError, e:
      print('APS: URLError = ' + str(e.reason))
    except httplib.HTTPException, e:
      print('APS: HTTPException')
    except Exception:
      print('APS: urllib2 generic exception')
    return ''
