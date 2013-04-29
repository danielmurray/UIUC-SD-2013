import geventreactor; geventreactor.install()
from twisted.internet import reactor
from flask import Flask, send_file, url_for, render_template, request, \
  session, redirect, flash, Markup, abort, Response
from socketio.server import SocketIOServer
import os
import hashlib
import socketio
import logger
import logging
import controller
import time
import random
import data
from gevent import monkey; monkey.patch_all()
import gevent

import args

args.init({
  "port": 8000,
  "debug": True
})
if args.get("debug"):
  logging.basicConfig(level=logging.DEBUG)
else:
  logging.basicConfig(level=logging.INFO)

app = Flask(__name__) 

app.config.update(
  SECRET_KEY = hashlib.sha1(os.urandom(24)).digest(),
  DEBUG = args.get("debug")
)

eventLogger = logger.EventLogger()
loxoneDevice = controller.LoxoneDevice()
# loxone controller works fine, just have to test registering the listeners and also making sure that sending message through the proxy method works

# singleton controllers
lightController = controller.LightController(loxoneDevice)
#sensor controllers
tempController = controller.TempController()
pyraController = controller.PyraController()
humidController = controller.HumidController()
flowController = controller.FlowController()
windoorController = controller.WindoorController()
co2Controller = controller.Co2Controller()
#Pass in the tempController and loxone controller to the Hvac controller for its operation
hvacController = controller.HvacController(loxoneDevice, tempController)
#dictionary to be passed to the relay controller
controller_dict = {
  'temp'    :tempController,
  'pyra'    :pyraController,
  'humid'   :humidController,
  'flow'    :flowController,
  'windoor' :windoorController,
  'co2'     :co2Controller,
  'hvac'    :hvacController,
}
relayDevice = controller.RelayDevice(controller_dict)

#power and energy controllers
powerController = controller.PowerController()
pvController = controller.PVController()

# every websocket controller must be in this list
controllers = [
  lightController,
  tempController,
  pyraController,
  humidController,
  flowController,
  windoorController,
  co2Controller,
  hvacController,
  powerController,
  pvController
]

# add the logger to every controller
map(lambda x: x.add_client(eventLogger), controllers)
history = data.History(controllers, 15)

@app.route("/")
def index():
  return render_template("index.html", debug=request.args.get("debug", False))

@app.route("/debug")
def debug():
  return render_template("debug.html", debug=request.args.get("debug", False))

@app.route("/ws")
def debugger():
  return render_template("websockets.html")

@app.route("/poke_debug")
def poke_debug():
  for i in range(0, 10):
    debugController.update({"id": "i-%s" % random.randint(0,5), "val1": hashlib.sha1(os.urandom(10)).hexdigest()})
    time.sleep(1)
  return "Poked debug sensor"

websocketNamespaces = {}
for c in controllers:
  websocketNamespaces["/%s" % c.typ] = c

@app.route("/socket.io/<path:remaining>")
def socket_path(remaining=None):
  print "New websocket connection"
  socketio.socketio_manage(request.environ, websocketNamespaces, request)
  return "end"

@app.route("/sensor",methods=['GET', 'POST'])
def sensor_data():
  """this should return the frequency"""
  mac_add = request.args.get('mac_address')
  typ = request.args.get('type')
  val = request.args.get('value')
  return '#'+str(relayDevice.on_message(mac_add, typ, val))+'#'

@app.route("/history", methods=["GET"])
def history_data():
  typ = request.args.get("type")
  id = request.args.get("id", -1)
  start = request.args.get("start")
  end = request.args.get("end")
  field = request.args.get("field")
  
if __name__ == '__main__':
  import signal
  print "Starting up"
  server = SocketIOServer(('', args.get("port")), app, transports=["websocket", "xhr-polling"])
  
  def stop_handler(signum, stackframe):
      print "Got signal: %s" % signum
      reactor.callFromThread(reactor.stop)
      os.exit(-1)
  signal.signal(signal.SIGINT, stop_handler)
  g = gevent.spawn(reactor.run)
  server.serve_forever()
