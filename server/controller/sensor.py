from ws import BackboneCollection
import gevent
import time
from flowmeter import FlowmeterDS
from sensor_dict import * #sensor dictionay is in here

# the sensor protocol works in the following way:
# all the sensors will make request to /sensor/data endpoint 
# with following URL parameters:
#     mac_address, type, and val
# the data is sent to RelayController 
# it simply relays it to relevant sensor controller


class RelayDevice(object):
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
    typ = "temp"
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
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
    typ = "pyra"
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)

class HumidController(BackboneCollection, ParentController):
    typ = "humid"
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)

class Co2Controller(BackboneCollection, ParentController):
    typ = "co2"
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)

class FlowController(BackboneCollection, ParentController):
    typ = "flow"
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.flowDS = {}
        self.freq = 10 #in seconds
        self.init_datastores()
        #this function calculates the flowrate every so often to update
        gevent.spawn(self._recalc_loop)

    def init_datastores(self):
        '''initalizes datastore for each of the flowmeters'''
        for key in sensor_list:
            if 'flow' in key.lower():
                self.flowDS.update({key: FlowmeterDS(self.freq)})

    def relay_update(self, hash_key, val):
        '''modified relay update function for the flowmeter
        because the values received here is not flowrate'''

        val = float(val)
        if  self.flowDS.has_key(hash_key):
            self.flowDS[hash_key].append(float(val))
            sensor_list[hash_key]["val"] = self.flowDS[hash_key].calc_flow()
            print "UPDATED", str(sensor_list[hash_key])
            self.update(sensor_list[hash_key])
        else:
            print "Flowmeter with no Datastore being updated! WHY?!"
            return -1

    def _recalc_loop(self):
        delay = int(self.freq * 1.5)
        while(1):
            time.sleep(delay)
            self.recalc_loop()


    def recalc_loop(self):
        '''return false to kill the loop on self in this function'''
        #loop through all the flow meter and update them
        print "FLOW RECALCULATION"
        for key,val in self.flowDS.items():
            tmp_rate = val.calc_flow()
            if sensor_list[key]['val'] != tmp_rate:
                #if the value has actually changed
                sensor_list[key]['val'] = tmp_rate
                self.update(sensor_list[key])



class WindoorController(BackboneCollection, ParentController):
    typ = "windoor"
    def __init__(self):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
