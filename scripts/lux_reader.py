import time
import sys
import os

libdir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))), 'lib')
print(libdir)

if os.path.exists(libdir):
    sys.path.append(libdir)

from waveshare_TSL2591 import TSL2591

sensor = TSL2591.TSL2591()
# sensor.SET_InterruptThreshold(0xff00, 0x0010)
try:
    while True:
        lux = sensor.Lux
        print('Lux: %d'%lux)
        sensor.TSL2591_SET_LuxInterrupt(50, 200)
        
    
except KeyboardInterrupt:    
    logging.info("ctrl + c:")
    sensor.Disable()
    exit()
