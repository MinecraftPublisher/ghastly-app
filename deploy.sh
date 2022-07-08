echo Configuring times...
# get current time
time=$(date +%s)
# multiply time by 1000 to get milliseconds
time=$(($time * 1000))
# write it to ./last-deploy as a timestamp with miliseconds
rm -r last-deploy
echo $time > last-deploy
echo Configuration finished.