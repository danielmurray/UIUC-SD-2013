# dictionary contains the data for mapping sensor data around the house
#sensor_list>{'sensor_type'>{'mac_address'>{'name'>'id'>f}}}
#run the extend_dict function before using it
#KEYS ARE CASE SENSITIVE
#type = [temp, pyra, humid, co2, flow, windoor]

_sensor_list = [
	{
		'mac_address':'mac-1',
		'type':'temp',
		'name':'room-1',
		'freq':4,
		'meta_data':{
			'location':'room-1',
		}
	},
	{
		'mac_address':'mac-1',
		'type':'humid',
		'name':'room-1',
		'freq':5,
		'meta_data':{
			'location':'room-1'
		}
	},
	{
		'mac_address':'mac-2',
		'type':'temp',
		'name':'kitchen',
		'freq':5,
		'meta_data':{
			'location':'kitchen'
		}
	},
	# {
	# 	'mac_address':,
	# 	'type':,
	# 	'name':,
	#	'freq':,
	# 	'meta_data':{
	# 		'location':,
	#		# anything else we want should be here
	# 	}
	# }
]

sensor_list = dict();
id_tracker = 0
for each in _sensor_list:
	hash_key = str(each['type'])+str(each['mac_address'])
	if not sensor_list.has_key(hash_key):
		#assign incrementing id
		each['id'] = id_tracker
		id_tracker += 1
		sensor_list[hash_key] = each #if match is found then set the dict to each
	else:
		print"Mac-address and type combination already exists"


