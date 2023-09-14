#!/bin/sh
TOTAL_IDLE_TIME=0

echo "$(date +"%D %T") true"

# ./user_activity_log

TOUCHPAD_INPUT_ID=$(\
xinput --list | \
awk '/MSFT0001:00 04F3:31AD Touchpad/ {print $6}' | \
sed 's/id=\(.*\)/\1/'\
)
MOUSE_INPUT_ID=$(\
xinput --list | \
awk '!/Keyboard/ && !/keyboard/ && /A4TECH USB Device/ {print $6}' | \
sed 's/id=\(.*\)/\1/'\
)
NATIVE_KEYBOARD_INPUT_ID=$(\
xinput --list | \
awk '!/pointer/ && /ITE Tech\. Inc\. ITE Device\(8910\) Keyboard/ {print $8}' | \
sed 's/id=\(.*\)/\1/'\
)
EXTERNAL_KEYBOARD_INPUT_ID=$(\
xinput --list | \
awk '!/pointer/ && !/System Control/ && !/Consumer Control/ && /SEMICO USB Keyboard/ {print $5}' | \
sed 's/id=\(.*\)/\1/'\
)

#echo $TOUCHPAD_INPUT_ID
#echo $MOUSE_INPUT_ID
#echo $NATIVE_KEYBOARD_INPUT_ID
#echo $EXTERNAL_KEYBOARD_INPUT_ID

while :
do
  USER_ACTIVITY=$(\
  timeout $ACTIVITY_TIMEOUT xinput test "$TOUCHPAD_INPUT_ID" & \
  timeout $ACTIVITY_TIMEOUT xinput test "$MOUSE_INPUT_ID" & \
  timeout $ACTIVITY_TIMEOUT xinput test "$NATIVE_KEYBOARD_INPUT_ID" & \
  timeout $ACTIVITY_TIMEOUT xinput test "$EXTERNAL_KEYBOARD_INPUT_ID"\
  )
  #echo $USER_ACTIVITY

  if [ -z "$USER_ACTIVITY" ]; then
    TOTAL_IDLE_TIME=$((TOTAL_IDLE_TIME+1))
    #echo $TOTAL_IDLE_TIME
  elif [ -n "$USER_ACTIVITY" -a $TOTAL_IDLE_TIME -ge $MAX_IDLE_TIME  ]; then
    TOTAL_IDLE_TIME=0
    echo "$(date +"%D %T") true"
    #echo $TOTAL_IDLE_TIME
  fi

  if [ $TOTAL_IDLE_TIME -eq $MAX_IDLE_TIME ]; then
    echo "$(date +"%D %T") false"
  fi

  USER_ACTIVITY=""
done

$SHELL
