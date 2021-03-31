echo "Start" >>  ~/auto-jobcan-output
echo $(date +"%H:%M:%S") >>  ~/auto-jobcan-output
#sleep ${RANDOM:0:1}m;
#sleep 1m;
#sleep $[ ( $RANDOM % 4 ) + 1 ]m
random=$[ ( $RANDOM % 4 ) + 1 ];
sleep ${RANDOM:0:1}m;
echo "${random} ngau nhien" >> ~/auto-jobcan-output
node ~/auto-jobcan/index.js >> ~/auto-jobcan-output
echo "End" >>  ~/auto-jobcan-output
echo $(date +"%H:%M:%S") >>  ~/auto-jobcan-output

