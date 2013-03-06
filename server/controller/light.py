# Lighting controller

from ws import BackboneCollection
import gevent
from autobahn.websocket import WebSocketClientFactory, WebSocketClientProtocol, connectWS
import requests, random, hmac, hashlib, base64, json
from light_ctrl.light_ctrl import *
import random

LOX_ADDR = '192.168.1.102'
PING_TIME = 10

class EchoIncoming(WebSocketClientProtocol):
    def __init__(self, parent, *args, **kwargs):
        self.parent = parent
        self.isClosed = False
        self.light_ctrl = light_controller(self)
        #WebSocketClientProtocol.__init__(*args, **kwargs)

    def onMessage(self,msg, binary):
        msg = self.parseMessage(msg)
        self.light_ctrl.on_message(msg)

    def parseMessage(self, msg):
        ''' parses the incoming message from the main loxone controller'''
        if '{"s":' in msg:
            return self.parseStateMsg(msg)
        elif '{"LL":' in msg:
            return self.parseVerMsg(msg)
        elif '{"LoxLIVE"' in msg:
            return self.parseConfigMsg(msg)
        else:
            return {
                "type":"ERR",
                "msg":None
            }

    def parseConfigMsg(self,msg):
        msg_dict = json.loads(msg)
        uuid_list = msg_dict['UUIDs']['UUID']
        return {
            "type":"config",
            "msg": uuid_list
        }

    def parseVerMsg(self,msg):
        msg_dict = json.loads(msg)
        return {
            "type":"ver",
            "msg":msg_dict
        }

    def parseStateMsg(self,msg):
        #parse the damn string
        states = msg.split('\r\n')
        states = states[:-1] #remove the last empty object
        state_list = []
        for each in states:
            tmp_dict = json.loads(each)['s']
            state_list.append(tmp_dict)
        return{
            "type":"state",
            "msg":state_list
        }
            
    def serverToClient(self, model):
        self.parent.update(model)
    def clientToServer(self, model):
        self.light_ctrl.c2s_update(model)
        print model
    def onOpen(self):
        self.a = 0
        self.initConnection()

    def initConnection(self):
        message = ["jdev/sps/LoxAPPversion","jdev/sps/getloxapp","jdev/sps/enablestatusupdate"]
        if self.a >= len(message):
            return
        self.sendMessage(message[self.a])
        self.a += 1
        gevent.Greenlet(self.initConnection).start_later(1)

    def onClose(self, wasClean, code, reason):
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
        print random.choice(["(>'.')>", "<('.'<)", ":)", ":(", "XD","oo","||","v"])
        gevent.sleep(1) # don't block event loop

  def do_save(self, data):
    if self.proxy:
      self.proxy.child.clientToServer(data)
    else:
      print("ERROR: No proxy connected?!")
