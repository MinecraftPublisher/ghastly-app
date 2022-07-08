echo Configuring times...
# get current time
time=$(($(date +%s%N)/1000000))
# write it to ./last-deploy as a timestamp with miliseconds
rm -r last-deploy
echo $time > last-deploy
echo Configuration finished.