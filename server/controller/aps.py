import requests, re
# BeautifulSoup 3.2.1
from BeautifulSoup import BeautifulSoup



def getVal(i):
  s = i.string if i.string else ''
  a = re.findall(r'\d+',s)
  return a[0] if len(a) > 0 else 0
def parse_aps_data():
  html = BeautifulSoup(requests.get('http://eric-johnson.net/APS-ECU/parameters.php').text)
  table = html.findAll('table')[0]
  panels = {}
  rows = table.tbody('tr')
  rows.pop(0)
  for row in rows:
    tds = row('td')
    data[getVal(tds[0])] = {
      'id':getVal(tds[0]),
      'power':getVal(tds[1]),
      'fq':getVal(tds[2]),
      'voltage':getVal(tds[3]),
      'temp':getVal(tds[4]),
      'date':getVal(tds[5])
    }
    panels.append(data)
  return panels

