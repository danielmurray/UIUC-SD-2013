from datetime import datetime,timedelta

class FlowMeterDS(object):
	def __init__(self, time_period):
		'''initialize the flowmeter datastore with the timeperiod'''
		self.history_store = [] # basic list that we store the value in
		self.time_period = timedelta(seconds = time_period)
		self.time_period_min = float(self.time_period.total_seconds())/60

	def append(self, value):
		if not type(value) == type(1):
			return False
		temp_dict = {'val':value,'time_stamp'=datetime.now()}
		self.history_store.append(temp_dict)

	def calculate_flow(self):
		filtered_vals = []
		# remove all the values that are older then the time period
		total_gals = 0
		for each in self.history_store:
			if abs(datetime.now()-each['time_stamp']) < self.time_period:
				filtered_vals.append(each)
				total_gals += each['val']
		#store this in the history store
		self.history_store = filtered_vals
		mins = 
		flow_rate = float(total_gals) / float()
		return 
