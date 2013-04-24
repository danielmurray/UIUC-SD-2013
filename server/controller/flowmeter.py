from datetime import datetime,timedelta



class FlowmeterDS(object):
	'''This class is meant to be used as storage and calculation of flow for each flowmeter sensor'''
	def __init__(self, time_period):
		'''initialize the flowmeter datastore with the timeperiod'''
		self.history_store = [] # basic list that we store the value in
		self.time_period = timedelta(seconds = time_period)
		self.time_period_min = float(self.time_period.total_seconds())/60

	def append(self, value):
		value = float(value)
		temp_dict = {'val':value,'time_stamp':datetime.now()}
		self.history_store.append(temp_dict)

	def calc_flow(self):
		'''looks in the history store to calculate the flow flow_rate
		it uses the last time_period data to calculate the flow_rate'''
		filtered_vals = []
		# remove all the values that are older then the time period
		total_gals = 0
		for each in self.history_store:
			if abs(datetime.now()-each['time_stamp']) < self.time_period:
				filtered_vals.append(each)
				total_gals += each['val']

		#store this in the history store
		self.history_store = filtered_vals
		#calculate the flow rate
		flow_rate = float(total_gals) / self.time_period_min
		return flow_rate
