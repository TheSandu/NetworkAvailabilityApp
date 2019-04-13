#!/bin/bash
gnome-terminal --tab -e "bash -c 'cd ~/Documents/NetworkAvailabilityService;node server.js; bash'" --tab -e "bash -c 'cd ~/Documents/NetworkAvailabilityApp;npm start;bash'" --tab -e "bash -c 'sleep 10;firefox -new-tab -url http://localhost:8080/api/connections;bash'" --tab -e "bash -c 'sleep 15;firefox -new-tab -url http://localhost:4200;bash'"
