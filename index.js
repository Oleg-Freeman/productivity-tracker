const exec = require('child_process').exec;
const { getConfig } = require('./config');

const  TRACKER_MAX_IDLE_TIME = getConfig('TRACKER_MAX_IDLE_TIME');
const TRACKER_ACTIVITY_TIMEOUT = getConfig('TRACKER_ACTIVITY_TIMEOUT');

child = exec(
    `ACTIVITY_TIMEOUT=${+TRACKER_ACTIVITY_TIMEOUT} MAX_IDLE_TIME=${+TRACKER_MAX_IDLE_TIME} ./get_input_devises_activity.sh`
);

child.stdout.setEncoding('utf8');
child.stdout.on('data', async (data) => {
    // data string format: MM/DD/YY HH:MM:SS true/false
    // TODO: add data to queue
    // TODO: integrate Google Sheets service
    const [trackingData, trackingTime, isWorking] = data.split(' ');
    const outputDate = new Date(trackingTime);
    console.log(data);
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', (data) => {
    console.error('Error: ' + data);

    throw new Error(data);
});

child.on('close', (code) => {
    console.log('closing code: ' + code);
});

child.on('exit', (code) => {
    console.log('exit code: ' + code);
});


