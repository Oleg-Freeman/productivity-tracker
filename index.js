// const { google } = require('googleapis')
const exec = require('child_process').exec;
child = exec('./get_input_devises_activity.sh');

child.stdout.setEncoding('utf8');
child.stdout.on('data', (data) => {
    // data string format: MM/DD/YY HH:MM:SS true/false
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


