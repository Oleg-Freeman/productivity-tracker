const exec = require('child_process').exec;
const { getConfig } = require('./config');
// const GoogleSheets = require('./google-sheets');

const TRACKER_MAX_IDLE_TIME = getConfig('TRACKER_MAX_IDLE_TIME');
const TRACKER_ACTIVITY_TIMEOUT = getConfig('TRACKER_ACTIVITY_TIMEOUT');

child = exec(
    `ACTIVITY_TIMEOUT=${+TRACKER_ACTIVITY_TIMEOUT} MAX_IDLE_TIME=${+TRACKER_MAX_IDLE_TIME} ./get_input_devises_activity.sh`
);

// const googleSheets = new GoogleSheets();
let previousState = false;

child.stdout.setEncoding('utf8');
child.stdout.on('data', async (isWorking) => {
    // TODO: add data to queue?

    if (!isWorking || typeof isWorking !== 'string' || isWorking.length === 0) {
        throw new Error('Invalid data: ' + isWorking);
    }
    if (previousState === isWorking) {
        throw new Error(
            `Get input device error: duplicate state "${isWorking}"`
        );
    }

    switch (isWorking.trim()) {
        case 'true': {
            console.log('Previous state: ' + previousState);
            console.log('Current state: ' + isWorking);

            previousState = true;
            break;
        }
        case 'false': {
            console.log('Previous state: ' + previousState);
            console.log('Current state: ' + isWorking);

            previousState = false;
            break;
        }
        default: {
            throw new Error('Unknown state: ' + isWorking);
        }
    }
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
