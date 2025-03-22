#!/bin/bash


while true; do
	/usr/bin/python3 /home/bunker/projects/light/lux-api/scripts/lux_reader.py | awk '/Lux:/ {print $2}' | xargs -I {} curl -X POST -H "Content-Type: application/json" -d '{"luxValue": {}}' http://localhost:3000/api/lux
	sleep 1
done
