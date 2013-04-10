from ws import BackboneCollection
import gevent
from sensor_dict import * #sensor dictionay is in here

# the sensor protocol works in the following way:
# all the sensors will make request to /sensor/data endpoint 
# with following URL parameters:
#     mac_address, type, and val
# the data is sent to RelayController 
# it simply relays it to relevant sensor controller


class RelayController(object):
    def __init__(self, controller_dict):
        self.controller_dict = controller_dict

    def on_message(self, mac_address,typ, value):
        mac_address = self.remove_quotes(mac_address)
        typ = self.remove_quotes(typ)
        value = self.remove_quotes(value)
        if self.controller_dict.has_key(typ):
            #if the controller for a given type exists relay it
            return self.controller_dict[typ].on_message(mac_address, value)
        else:
            return -1

    def remove_quotes(self, word):
        '''takes care to remove all the quotes from a string'''
        word = str(word)
        word = word.replace('"','')
        word = word.replace("'","")
        return word

class ParentController(object):
    '''this simply takes in the mac add and val from the sensor
    and updates the sensor object in the in-memory dictionary of sensors'''
    def on_message(self, mac_add, val):
        '''initialize self.typ in the init function else this will throw error'''
        if not self.typ:
            print "type:"+str(self.typ)+" doesn't exist"
            return -1

        hash_key = str(self.typ) + str(mac_add)

        #make sure the sensor exists in the dict
        global sensor_list
        if not sensor_list.has_key(hash_key):
            print "type and mac_add combo not found in the dict"
            return -1
        #make async call to update the front end to close the req asap
        gevent.Greenlet(self._update, hash_key, val).start_later(1)
        #return the freq
        return sensor_list[hash_key]['freq']
        

    def _update(self, hash_key, val):
        '''over ride this function if needed'''
        #update the value in the global dict
        sensor_list[hash_key]['val'] = val
        self.update(sensor_list[hash_key])
        #just for debug
        print sensor_list[hash_key] 



class TempController(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'temp'

class PyraController(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'pyra'

class HumidController(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'humid'

class Co2Controller(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'co2'

class FlowController(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'flow'

class WindoorController(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'windoor'