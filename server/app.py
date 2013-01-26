from gevent import monkey; monkey.patch_all()
from flask import Flask, send_file, url_for, render_template, request, \
  session, redirect, flash, Markup, abort, Response
import os
import hashlib

import args
args.init({
  "port": 8000,
  "debug": True
})

app = Flask(__name__) 

app.config.update(
  SECRET_KEY = hashlib.sha1(os.urandom(24)).digest(),
  DEBUG = args.get("debug")
)

@app.route("/")
def index():
  return render_template("index.html")

if __name__ == '__main__':
  from gevent.wsgi import WSGIServer
  server = WSGIServer(("0.0.0.0", args.get("port")), app)
  server.serve_forever()