"""
Logging endpoint
"""

import logging

class EventLogger:
  def do_update(self, name, data):
    logging.debug("Sensor update: %s = %s" % (name, data))
