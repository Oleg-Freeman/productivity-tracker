const { google } = require('googleapis')
const exec = require('child_process').exec;

child = exec('./get_input_devises_activity.sh');
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const spreadsheetId = '1IHFinbMztjfZrfj7-OAyKBlFK3eaAvfM7ZB2NHFYLG8'

child.stdout.setEncoding('utf8');
child.stdout.on('data', async (data) => {
    // data string format: MM/DD/YY HH:MM:SS true/false
    console.log(data);

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    const metadata = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    console.log(metadata.data);
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


