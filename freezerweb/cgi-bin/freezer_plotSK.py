#!/usr/bin/env python

#import matplotlib functions and set it to output files instead of printing to an X window
import matplotlib
matplotlib.use('Agg')
from pylab import figure, show, xlabel, ylabel, title
from matplotlib.dates import HourLocator, MinuteLocator, DateFormatter
import sys

#import our database class 
from FreezerDb import FreezerDb

# Database settings
db_settings = {'user': 'frzr_log_script',
	       'pass': 'emergencystop',
	       'host': '172.26.0.99',
	       'db': 'frzr'}

db = FreezerDb(db_settings['user'], db_settings['pass'],
               db_settings['host'], db_settings['db'])

# get pressures and dates from the database
pressures, dates = db.get_pressure(750)

# create a figure and a plot in it
fig = figure()
pressure = fig.add_subplot(111)

# format the dates properly
pressure.xaxis.set_major_locator(HourLocator(range(1,25), interval=6))
pressure.xaxis.set_major_formatter(DateFormatter('%d-%M %H:%M'))
pressure.xaxis.set_minor_locator(MinuteLocator())
pressure.autoscale_view()

# plot the values
pressure.plot_date(dates, pressures, '-')

# set axis labels and title
title('Freezer Pressure Plot')
ylabel('Pressure (bar)')
xlabel('Date')

# show grid and show the plot
pressure.grid(True)
fig.autofmt_xdate()
fig.savefig('../images/pressure.png', dpi=75)
