import xml.etree.ElementTree as ET
import urllib2

def fetch_data():
  server_url = "http://128.174.180.40/cgi-bin/egauge?tot"
  return make_request(server_url, None)

def parse_xml(unparsed_xml):
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

def make_request(url, data):
  req = urllib2.Request(url, data)
  response = urllib2.urlopen(req)
  return response.read()

def get_eguage_data():
  return parse_xml(fetch_data())