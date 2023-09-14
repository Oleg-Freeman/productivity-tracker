const { google } = require('googleapis')
const exec = require('child_process').exec;

require('dotenv').config();

const { TRACKER_ACTIVITY_TIMEOUT, TRACKER_MAX_IDLE_TIME, GOOGLE_SPREADSHEET_ID } = process.env;

child = exec(
    `ACTIVITY_TIMEOUT=${+TRACKER_ACTIVITY_TIMEOUT} MAX_IDLE_TIME=${+TRACKER_MAX_IDLE_TIME} ./get_input_devises_activity.sh`
);
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const spreadsheetId = GOOGLE_SPREADSHEET_ID;

child.stdout.setEncoding('utf8');
child.stdout.on('data', async (data) => {
    // data string format: MM/DD/YY HH:MM:SS true/false
    console.log(data);

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    // const metadata = await googleSheets.spreadsheets.get({
    //     auth,
    //     spreadsheetId,
    // });

    // console.log(metadata.data);
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


