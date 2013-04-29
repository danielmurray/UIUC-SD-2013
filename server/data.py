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

  def get(self, typ, field, id, start, end, group_by, period):
    """
    typ is the sensor type constant
    field is the selector into the JSON data (hvac_data.temp)
    id is optional
    start, end are unix timestamps
    group_by performs a grouping operation [sum, avg, none]
    period is the number of seconds to group together
    """
    sql = "SELECT time, data FROM sensor_history WHERE type = ? AND time >= ? AND time <= ?"
    args = [typ, start, end]
    if id:
      sql += "AND id = ? "
      args.append(id)
    sql += "ORDER BY time ASC"

    result = conn.execute(sql, args)

    group_fn = None
    def group_sum(l):
      sum = 0
      for v in l:
        sum = sum + v
      return [sum]
    def group_avg(l):
      return [float(x) / len(l) for x in group_sum(l)]
    def group_none(l):
      return l

    if group_by == "sum":
      group_fn = group_sum
    elif group_by == "avg":
      group_fn = group_avg
    elif group_by == "none":
      group_fn = group_none
    else:
      abort(400)

    # group the rows by the same times, then execute group_fn
    graph = [] # (time, float(data[field]))
    group = []
    field_parts = field.split(".")
    cur_time = -1
    rows = result.fetchall()
    rows.append({"time": -1}) # needs an extra value for the cleanup
    for i in range(0, len(rows)):
      row = rows[i]
      time = row["time"]
      if time > cur_time + period or time == -1:
        if cur_time > 0: # don't add for the first iteration
          for g in group_fn(group):
            graph.append((cur_time*1000, g))
        if i >= len(rows)-1:
          break
        group = []
        cur_time = time
      field_data = json.loads(row["data"])
      for part in field_parts:
        field_data = field_data[part]
      group.append(float(field_data))
    return graph
