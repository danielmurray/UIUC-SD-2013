# Lighting controller

from ws import BackboneCollection
import gevent

class LightController(BackboneCollection):
  def __init__(self):
    self.ws = None # make the websocket connection + send auth

    # start a new thread to talk with the lighting controller over websockets
    gevent.spawn(self._run_websocket_loop)
    BackboneCollection.__init__(self)

  def _run_websocket_loop(self):
    while True:
      # if self.ws.disconnected():
      #   try to reconnect
      # data = self.ws.recv()
      # data is {id: "something", ...other vals...}
      # self.update(data)
      gevent.sleep(0) # don't block event loop

  def do_save(self, data):
    # send a new websocket message to change the light value
    pass