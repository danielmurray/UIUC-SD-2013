# Stored Data API
import gevent
import time
import json
import sqlite3
conn = sqlite3.connect('data.sqlite')
conn.row_factory = sqlite3.Row
try:
  result = conn.execute("SELECT COUNT(*) FROM sensor_history")
  print("History database contains %s rows" % result.fetchone()[0])
except sqlite3.OperationalError:
  schema = """
  CREATE TABLE sensor_history
  (time INTEGER, type TEXT, id TEXT, data TEXT);
  """
  conn.execute(schema)

def save_cache(data):
  pass

def get_range(sensor_name, id=None, start=None, end=None, resolution=0):
  """
  id [optional] gets sensor data for a single id
  
  """

class History:
  def __init__(self, collections, period):
    self.collections = collections
    self.period = period
    gevent.spawn(self.save_loop)

  def save_loop(self):
    # fire off a save event every X seconds
    while True:
      gevent.sleep(self.period)
      gevent.spawn(self.save)

  def save(self):
    # save all of the collections to the database
    insert_history = "INSERT INTO sensor_history (time, type, id, data) VALUES (?,?,?,?)"
    data = []
    t = int(time.time())
    for collection in self.collections:
      typ = collection.typ
      for id, model in collection.models.iteritems():
        data.append((t, str(typ), str(id), json.dumps(model)))
    print("Saving history for %d models" % len(data))
    c = conn.cursor()
    c.executemany(insert_history, data)
    conn.commit()