# Loxone
import gevent
from autobahn.websocket import WebSocketClientFactory, WebSocketClientProtocol, connectWS
import requests, random, hmac, hashlib, base64, json

LOX_ADDR = '10.1.18.78'
LOX_USER = 'admin'
LOX_PASS = 'sd-piface'
PING_TIME = 10

class EchoIncoming(WebSocketClientProtocol):
    def __init__(self, parent, *args, **kwargs):
        self.parent = parent
        self.initialized = False
        self.msg_list = []
        self.listners = []
        self.config_received = False
        gevent.Greenlet(self.parent.clear_listner_list).start_later(1)

    def registerListner(self, listner):
        if callable(listner):
            self.listners.append(listner)
        if self.config_received:
            listner(self.config_msg)


    def onMessage(self,msg, binary):
        '''relay any message received to all the listners'''
        msg = self.parseMessage(msg) #parse it first based on the spec
        print "\nLOX::Incoming--------"
        print msg
        print "LOX------------------\n"
        for each in self.listners:
            each(msg) #call each listner with the message

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
        self.config_received = True
        msg =  {
            "type":"config",
            "msg": uuid_list
        }
        self.config_msg = msg
        return msg

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

    def onOpen(self):
        self.a = 0
        self.initConnection()

    def initConnection(self):
        message = ["jdev/sps/LoxAPPversion","jdev/sps/getloxapp","jdev/sps/enablestatusupdate"]
        if self.a >= len(message):
            self.initialized = True 
            return
        self.sendMessage(message[self.a])
        gevent.Greenlet(self.initConnection).start_later(1)
        self.a += 1

    def send_message(self, msg):
        '''this makes sure that the socket is initalized before the message is relayed'''
        if msg:
            self.msg_list.append(msg) #push it to the msg queue
        if not self.initialized:
            gevent.Greenlet(self.send_message, None).start_later(1)
            return
        self.clear_msg_list()

    def clear_msg_list(self):
        for each in range(len(self.msg_list)):
            self.sendMessage(self.msg_list.pop(0))

    def onClose(self, wasClean, code, reason):
        print "LOX::Socket Closed--- Was Clean:"+str(wasClean)+" Code:"+str(code) + " Reason:" +reason
        self.parent.isClosed = True

class LoxoneDeviceProxy:
    '''proxy class, this is because we can access EchoIncoming's methods in LoxoneController'''
    def __init__(self, parent):
        self.parent = parent

    def __call__(self, *args, **kwargs):
        self.child = EchoIncoming(self.parent, *args, **kwargs)
        return self.child

class LoxoneDevice(object):
    '''this is the only thing that will be exposed to other controllers, 
    for no reason should the EchoIncoming's instance be used anywhere,
    basic two function will help any other controllers communicate through the socket
    register_listner: register a function that will be called each time msg is received via socket
    send_message: this will send message to the socket'''
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        self.initialized = False
        self.listner_list = [] #stack for listner while sock is initalized
        # start a new thread to talk with the lighting controller over websockets
        gevent.spawn(self._run_websocket)

    def _run_websocket(self):
        self.proxy = LoxoneDeviceProxy(self)
        while True:
            print "LOX_DEVICE::(re?)starting socket------"
            self.create_socket()
    
    def create_socket(self):
        num = random.random()
        try:
            r = requests.get('http://'+LOX_ADDR+'/jdev/sys/getkey?'+str(num))
            pass
        except Exception, e:
            print "LOX_DEVICE::auth key request failed"
            raise
        else:
            if(r.status_code == 200):
                protocol = hmac.new(r.json()['LL']['value'].decode("hex"), LOX_USER+":"+LOX_PASS, digestmod=hashlib.sha1).digest().encode("hex")
                factory = WebSocketClientFactory("ws://"+LOX_ADDR+"/ws/",protocols = [protocol], debug=True)
                factory.protocol = self.proxy
                connectWS(factory)
                self.isClosed = False
            else:
                print "LOX_DEVICE::Failed to Handshake with loxone:HTTP_STATUS_CODE:"+r.status_code
                return
            self.initialized = True
            while not self.isClosed:
                print random.choice(["(>'.')>", "<('.'<)", ":)", ":(", "XD","oo","||","u"])
                gevent.sleep(1) # don't block event loop
            gevent.sleep(1)
            print "End: create_socket"
            # Put Reconnect code here???
        finally:
            pass

    def register_listner(self, listner):
        '''register a function that will be called whenever a message is received on the socket'''
        if not self.initialized:
            self.listner_list.append(listner)
        elif self.proxy: #if the socket is initiazlied then we just register the listner
            self.proxy.child.registerListner(listener)


    def clear_listner_list(self):
        if self.proxy:
            for each in range(len(self.listner_list)):
                self.proxy.child.registerListner(self.listner_list.pop(0))
        else:
            print("LOX_DEVICE::No proxy >.< found")


    def send_message(self, message):
        '''send a message through the socket'''
        if not self.initialized:
            print "LOX_DEVICE::Something tried to send message too early! Message ignore"
            return
        if self.proxy:
            self.proxy.child.send_message(message)
        else:
            print("LOX_DEVICE::No proxy >.< found")
