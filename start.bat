ECHO OFF
ECHO SEARCHING FOR UPDATES ...
git fetch
git reset --hard origin/master
ECHO INSTALLING NODE DEPENDENCIES
CALL npm install
ECHO STARTING THE PROGRAM ...
npm start
