from ws import BackboneCollection
import gevent
from hvac_dict import * #sensor dictionay is in here



class HvacController(BackboneCollection):
    typ = "hvac"
    def __init__(self, loxone, temp):
        self.ws = None # make the websocket connection + send auth
        BackboneCollection.__init__(self)
        self.sock = loxone
        loxone.register_listner(self.on_message)
        temp.register_listner(self.on_temp_change)


    def on_message(self, msg):
        if(msg['type'] == "config"):
            self.parse_config(msg['msg'])
        elif(msg['type']=="state"):
            self.parse_state(msg['msg'])

    def parse_config(self, msg):
        for each in msg:
            if each['UUID'] == hvac_uuids["hvac_state_uuid"]["cooling"]:
                hvac_uuids["hvac_state_uuid"]["n_cool"] = each["n"]
            elif each['UUID'] == hvac_uuids["hvac_state_uuid"]["heating"]:
                hvac_uuids["hvac_state_uuid"]["n_heat"] = each["n"]
            elif each['UUID'] == hvac_uuids["tar_temp_uuid"]:
                hvac_uuids["tar_temp_n"] = each["n"]
            elif each['UUID'] == hvac_uuids["avg_temp_uuid"]:
                hvac_uuids["avg_temp_n"] = each["n"]

    def parse_state(self, msg):
        change = False
        for each in msg:
            if hvac_uuids["hvac_state_uuid"]["n_cool"] == each["n"]:
                if str(each['v']) == "1":
                    hvac_uuids["hvac_state_uuid"]["cooling"] = True
                    hvac_uuids["hvac_state"] = "Cooling"
                    change = True
                else:
                    hvac_uuids["hvac_state_uuid"]["cooling"] = False
                    change = True
            elif hvac_uuids["hvac_state_uuid"]["n_heat"] == each["n"]:
                if str(each['v']) == "1":
                    hvac_uuids["hvac_state"] = "Heating"
                    hvac_uuids["hvac_state_uuid"]["heating"] = True
                    change = True
                else:
                    hvac_uuids["hvac_state_uuid"]["heating"] = False
                    change = True
            elif hvac_uuids["tar_temp_n"] == each["n"]:
                if hvac_uuids["tar_temp"] != each["v"]:
                    hvac_uuids["tar_temp"] = each["v"]
                    self.update(hvac_uuids)
            elif hvac_uuids["avg_temp_n"] == each["n"]:
                #print "avg temp"
                if hvac_uuids["avg_temp"] != each["v"]:
                    hvac_uuids["avg_temp"] = each["v"]
                    self.update(hvac_uuids)

        if change:
        #set the hvac_state to idle if both  are doing nothing
            if hvac_uuids["hvac_state_uuid"].has_key("heating") and hvac_uuids["hvac_state_uuid"].has_key("cooling"):
                if not hvac_uuids["hvac_state_uuid"]["heating"] and not hvac_uuids["hvac_state_uuid"]["cooling"]:
                    hvac_uuids["hvac_state"] = "Off"
            self.update(hvac_uuids)
            #print "HVAC::State:",hvac_uuids['hvac_state']


    def on_temp_change(self, avg_temp):
        """relay the avg temp value to the loxone server"""
        if hvac_uuids["avg_temp"] == avg_temp:
            #incase the avg temp hasn't changed, don't worry about telling everyplace about this
            return False
        hvac_uuids["avg_temp"] = avg_temp
        sock_str = "jdev/sps/io/"+hvac_uuids["avg_temp_uuid"]+"/"+str(int(avg_temp))
        #print "HVAC:: Avg Temperature:", avg_temp
        #on change of average temp make sure to relay the change to both the loxone and the client
        self.sock.send_message(sock_str)
        self.update(hvac_uuids)        

    def do_save(self, data):
        """assuming the same model as the hvac_dict is sent back to the server"""
        if hvac_uuids["tar_temp"] == data["tar_temp"]:
            #if nothing changes then just return
            return
        hvac_uuids["tar_temp"] = data["tar_temp"]
        sock_str = "jdev/sps/io/"+hvac_uuids["tar_temp_uuid"]+"/"+str(int(hvac_uuids["tar_temp"]))
        #print "HVAC:: setting temperature:", data['tar_temp']
        self.sock.send_message(sock_str)