# dictionary contains the data for mapping sensor data around the house
#sensor_list>{'sensor_type'>{'mac_address'>{'name'>'id'>f}}}
#run the extend_dict function before using it
#KEYS ARE CASE SENSITIVE
#type = [temp, pyra, humid, co2, flow, windoor]

_sensor_list = [
	{
		'mac_address':'mac-1',
		'type':'temp',
		'name':'kitchen',
		'freq':0,
		'meta_data':{
			'zone':'kitchen',
		}
	},
	{
		'mac_address':'mac-1',
		'type':'pyra',
		'name':'kitchen',
		'freq':1,
		'meta_data':{
			'zone':'kitchen'
		}
	},	
	{
		'mac_address':'mac-1',
		'type':'humid',
		'name':'kitchen',
		'freq':2,
		'meta_data':{
			'zone':'kitchen',
		}
	},
	{
		'mac_address':'mac-1',
		'type':'co2',
		'name':'kitchen',
		'freq':3,
		'meta_data':{
			'zone':'kitchen',
		}
	},	
	{
		'mac_address':'mac-1',
		'type':'flow',
		'name':'kitchen',
		'freq':4,
		'meta_data':{
			'zone':'kitchen',
		}
	},
	{
		'mac_address':'mac-1',
		'type':'windoor',
		'name':'kitchen',
		'freq':5,
		'meta_data':{
			'zone':'kitchen',
		}
	},
	{
		'mac_address':'mac-2',
		'type':'windoor',
		'name':'kitchen',
		'freq':5,
		'meta_data':{
			'zone':'kitchen',
		}
	},
	{
		'mac_address':'mac-2',
		'type':'temp',
		'name':'kitchen',
		'freq':5,
		'meta_data':{
			'zone':'kitchen'
		}
	},
	# {
	# 	'mac_address':,
	# 	'type':,
	# 	'name':,
	#	'freq':,
	# 	'meta_data':{
	# 		'zone':,
	#		# anything else we want should be here
	# 	}
	# }
]

sensor_list = dict();
id_tracker = 1
for each in _sensor_list:
	hash_key = str(each['type'])+str(each['mac_address'])
	if not sensor_list.has_key(hash_key):
		#assign incrementing id
		each['id'] = id_tracker
		id_tracker += 1
		sensor_list[hash_key] = each #if match is found then set the dict to each
	else:
		print"Mac-address and type combination already exists"


