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
        self.load_all_sensors()

    def load_all_sensors(self):
        for key, value in sensor_list.items():
            self.on_message(value['mac_address'],value['type'], -1)
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
        gevent.Greenlet(self.relay_update, hash_key, val).start_later(1)
        #return the freq
        return sensor_list[hash_key]['freq']
        

    def relay_update(self, hash_key, val):
        '''over ride this function if needed'''
        #update the value in the global dict

        if  sensor_list[hash_key].has_key("val") and sensor_list[hash_key]['val'] == val:
            #check if the value has actually changed before updating the client unnecessarily
            #this also prevents relaying the same avg temp to the loxone server
            return
        sensor_list[hash_key]['val'] = val
        print "UPDATED", str(sensor_list[hash_key])
        self.update(sensor_list[hash_key])
        #just for debug
        print sensor_list[hash_key] 

    def do_save(self, data):
        print "Invalid call from client to update the state of sensor-------"
        print data



class TempController(BackboneCollection, ParentController):

    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.typ = 'temp'
        self.listners = []

    def register_listner(self, listner):
        if callable(listner):
            self.listners.append(listner)

    def relay_update(self, hash_key, val):
        #call the parent controller update first        
        super(TempController, self).relay_update(hash_key, val)
        #now calculate the avg temp and relay it to the listners
        avg_temp = self.avg_temp()
        for each in self.listners:
            #call the remote function with the JSON object of the update temperature.
            each(avg_temp)

    def avg_temp(self):
        total_temp = 0
        n = 0
        outdoor_locations = ["Outdoor", "Outdoors", "outdoor", "outdoors"]
        for key, value in sensor_list.items():
            if value['type'] == 'temp':
                if value['meta_data']['location'] not in outdoor_locations:
                    if value.has_key("val"):
                        total_temp += float(value['val'])
                        n += 1
        return total_temp/n

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
