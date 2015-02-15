SD2013-UIUC
===========

UIUC's Smart Home App for the China's First Solar Decathlon in 2013

## Setup

### (If) on Debian Server

- `sudo apt-get install python-pip python-dev libevent-dev`

### (If) on OSX Server

- Install Xcode and Install Command Line Tools
- Follow the directions on this site to install libevent -> http://www.cloudspace.com/blog/2009/01/13/installing-libevent-on-mac-osx/
- `sudo apt-get install pip`

### Install pip and virtualenv

- `cd SD2013-UIUC/server`
- `virtualenv2 .`
- `bin/pip install -r requirements.txt`

### Running

- `cd SD2013-UIUC/server`
- `bin/python2 app.py`

