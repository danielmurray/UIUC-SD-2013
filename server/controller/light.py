# Lighting controller

from ws import BackboneCollection
import gevent
from autobahn.websocket import WebSocketClientFactory, WebSocketClientProtocol, connectWS
import requests, random, hmac, hashlib, base64, json

LOX_ADDR = '130.126.29.12'
PING_TIME = 10

light_mapping = [  
    {
      "UUID":"8208bb0c-9197-11e0-806c9f19214c414c",
      "name":"kitchen",
      "n":"-1",
    },
    {
      "UUID":"974dc1e9-76de-11e2-849982650d05814e",
      "name":"livingroom",
      "n":'-1',
    }
]

class EchoIncoming(WebSocketClientProtocol):
    def __init__(self, parent, *args, **kwargs):
      self.parent = parent
      self.isClosed = False
      #WebSocketClientProtocol.__init__(*args, **kwargs)

    def onMessage(self,msg, binary):
      if '{"s":' in msg:
        self.parseStateMsg(msg)
      elif '{"LL":' in msg:
        self.parseVerMsg(msg)
      elif '{"LoxLIVE"' in msg:
        self.parseConfigMsg(msg)

    def parseConfigMsg(self,msg):
      print 'Config Msg'
      msg_dict = json.loads(msg)
      n_list = msg_dict['UUIDs']['UUID']
      for each in light_mapping:
        uuid = each['UUID'] #the uuid's n we are looking for
        for n in n_list:
          if n['UUID'] == uuid:
            each['n'] = n['n']

      print msg_dict

    def parseVerMsg(self,msg):
      print 'Ver msg'
      msg_dict = json.loads(msg)
      print msg_dict

    def parseStateMsg(self,msg):
      #parse the damn string
      states = msg.split('\r\n')
      states = states[:-1] #remove the last empty object
      for each in states:
        tmp_dict = json.loads(each)['s']
        for light in light_mapping:
          if light['n'] == tmp_dict['n']: #we found the damn light
            light['v'] = tmp_dict['v']
            #convert keys properly
            light['current'] = float(light['v'])
            light['id'] = light['name']
            # {id: None, name: "", current: 0}
            self.parent.update(light)


    def updateLight(self, data):
      n = str(data['id'])
      v = str(data['current'])
      uuid = "-1"
      for each in light_mapping:
        if str(n) == each['n']: #found the light
          uuid = each["UUID"]
          break
      if uuid == "-1":
        print "Light not found", uuid
        return
      msg = "jdev/sps/io/"+uuid+"/"+str(v)
      self.sendMessage(msg)

    def testDatShit(self):
      n = light_mapping[0]['n']
      if 'v' in light_mapping[0].keys():
        v = float(light_mapping[0]['v']) + 1
        if v > 10:
          v = 0
        self.updateLight(n,v)
      gevent.Greenlet(self.testDatShit).start_later(2)
      #reactor.callLater(2,self.testDatShit)

    def onOpen(self):
        self.parent.isClosed = False
        # do someting
        #message = "dev/sps/io/BreadButton2/pulse"
        self.a = 0
        self.initConnection()
        # self.testDatShit()
        # self.custPing()

    def custPing(self):
        self.sendMessage("jdev/sps/LoxAPPversion")
        gevent.Greenlet(self.custPing).start_later(PING_TIME)
        #reactor.callLater(PING_TIME, self.custPing)

    def initConnection(self):
        message = ["jdev/sps/LoxAPPversion","jdev/sps/getloxapp","jdev/sps/enablestatusupdate"]
        if self.a >= len(message):
            return
        self.sendMessage(message[self.a])
        self.a += 1
        gevent.Greenlet(self.initConnection).start_later(1)

    def onClose(self, wasClean, code, reason):
        self.parent.isClosed = True
        print "Socket Closed--- Was Clean:"+str(wasClean)+" Code:"+str(code) + " Reason:" +reason

class LightControllerProxy:
  def __init__(self, parent):
    self.parent = parent
    self.isClosed = False

  def __call__(self, *args, **kwargs):
    self.child = EchoIncoming(self.parent, *args, **kwargs)
    return self.child

class LightController(BackboneCollection):
  def __init__(self):
    self.ws = None # make the websocket connection + send auth

    # start a new thread to talk with the lighting controller over websockets
    gevent.spawn(self._run_websocket_loop)
    BackboneCollection.__init__(self)

  def _run_websocket_loop(self):
    self.proxy = LightControllerProxy(self)
    while True:
      num = random.random()
      r = requests.get('http://'+LOX_ADDR+'/jdev/sys/getkey?'+str(num))

      if(r.status_code == 200):
          print "Doing something"
          protocol = hmac.new(r.json()['LL']['value'].decode("hex"), "admin:admin", digestmod=hashlib.sha1).digest().encode("hex")
          factory = WebSocketClientFactory("ws://"+LOX_ADDR+"/ws/",protocols = [protocol], debug=True)
          factory.protocol = self.proxy
          connectWS(factory)
      else:
          print "FAIL!"+r.status_code
      while not self.proxy.isClosed:
        gevent.sleep(1) # don't block event loop

  def do_save(self, data):
    if self.proxy:
      self.proxy.child.updateLight(data)
    else:
      print("ERROR: No proxy connected?!")
