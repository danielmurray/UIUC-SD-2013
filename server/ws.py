"""
socket.io namespaces

Each backbone.js model connects to a namespace
"""

from socketio.namespace import BaseNamespace

class BackboneModel:
  pass

class BackboneCollection(BaseNamespace):
  model = None # this needs to be a subclass of BackboneModel

  def on_fetch(self, tid):
    pass

  def on_save(self, data):
    pass
