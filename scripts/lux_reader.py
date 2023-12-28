import time
import sys
import os
import RPi.GPIO as GPIO
import time
import subprocess

-libdir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))), 'lib')

if os.path.exists(libdir):
    sys.path.append(libdir)

from waveshare_TSL2591 import TSL2591

sensor = TSL2591.TSL2591()
# does this fire for when it drops below 50 and when it goes above 50?
sensor.TSL2591_SET_LuxInterrupt(10, 200)

INT_PIN = 4

GPIO.setmode(GPIO.BCM)
GPIO.setup(INT_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def update_lux(lux):
    data = "\"luxValue\": {luxValue}".format(luxValue = lux)
    data =  "%s %s %s" % ("{", data, "}")
    print(data)
    command_curl = "curl -X POST -H \"Content-Type: application/json\" -d {jsonData} localhost:3000/api/lux".format(jsonData = data)
    print(command_curl)
    send_curl(command_curl)

def send_curl(command):
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

try:
    while True: 
        channel = GPIO.wait_for_edge(INT_PIN, GPIO.FALLING, timeout=500)
        if channel is not None:
            lux = sensor.Lux
            update_lux(lux)
        time.sleep(0.5)
except KeyboardInterrupt:    
    sensor.Disable()
    exit()
