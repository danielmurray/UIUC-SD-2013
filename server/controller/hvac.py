from ws import BackboneCollection
import gevent
from hvac_dict import * #sensor dictionay is in here



class HvacController(BackboneCollection):

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
        else:
            print "not sure what msg"

    def parse_config(self, msg):
        for each in msg:
            if each['UUID'] == hvac_uuids["hvac_state"]["uuid_cooling"]:
                hvac_uuids["hvac_state"]["n_cool"] = each["n"]
            elif each['UUID'] == hvac_uuids["hvac_state"]["uuid_heating"]:
                hvac_uuids["hvac_state"]["n_heat"] = each["n"]

    def parse_state(self, msg):
        change = False
        for each in msg:
            if hvac_uuids["hvac_state"]["n_cool"] == each["n"]:
                if str(each['v']) == "1":
                    hvac_uuids["hvac_state"]["cooling"] = True
                    hvac_uuids["hvac_state"]["val"] = "Cooling"
                    change = True
                else:
                    hvac_uuids["hvac_state"]["cooling"] = False
                    change = True
            elif hvac_uuids["hvac_state"]["n_heat"] == each["n"]:
                if str(each['v']) == "1":
                    hvac_uuids["hvac_state"]["val"] = "Heating"
                    hvac_uuids["hvac_state"]["heating"] = True
                    change = True
                else:
                    hvac_uuids["hvac_state"]["heating"] = False
                    change = True

        if change:
        #set the hvac_state to idle if both are doing nothing
            if hvac_uuids["hvac_state"].has_key("heating") and hvac_uuids["hvac_state"].has_key("cooling"):
                if not hvac_uuids["hvac_state"]["heating"] and not hvac_uuids["hvac_state"]["cooling"]:
                    hvac_uuids["hvac_state"]["val"] = "Off"
            self.update(hvac_uuids)
            print hvac_uuids['hvac_state']['val'],'--------------------------'


    def on_temp_change(self, avg_temp):
        """relay the avg temp value to the loxone server"""
        hvac_uuids["avg_temp"]["val"] = avg_temp
        sock_str = "jdev/sps/io/"+hvac_uuids["avg_temp"]["uuid"]+"/"+str(int(avg_temp))
        print "avg_temp called", sock_str
        self.sock.send_message(sock_str)

    def do_save(self, data):
        """assuming the same model as the hvac_dict is sent back to the server"""
        if hvac_uuids["tar_temp"]["val"] == data["tar_temp"]["val"]:
            #if nothing changes then just return
            return
        hvac_uuids["tar_temp"]["val"] = data["tar_temp"]["val"]
        sock_str = "jdev/sps/io/"+hvac_uuids["tar_temp"]["uuid"]+"/"+str(int(hvac_uuids["tar_temp"]["val"]))
        print "tar_temp called", sock_str
        self.sock.send_message(sock_str)