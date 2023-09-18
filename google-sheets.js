const { getConfig } = require('./config');
const { google } = require('googleapis');
const dayjs = require('dayjs')

class GoogleSheets {
    constructor() {
        this.auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        });
        this.spreadsheetId = getConfig('GOOGLE_SPREADSHEET_ID');
        this.client = null;
        this.googleSheets = null;
    }

    async getClient() {
        if (!this.client) {
            this.client = await this.auth.getClient();
        }

        return this.client;
    }

    async getSheets() {
        if (!this.googleSheets) {
            const client = await this.getClient();
            this.googleSheets = google.sheets({ version: 'v4', auth: client });
        }

        return this.googleSheets;
    }

    async createSheetIfNotExists(sheetName) {
        const { auth, spreadsheetId } = this;
        const googleSheets = await this.getSheets();
        const metaData = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId,
        });
        const sheet = metaData.data.sheets.find(sheet => sheet.properties.title === sheetName);

        if (!sheet) {
            await googleSheets.spreadsheets.batchUpdate({
                auth,
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: sheetName,
                                },
                            },
                        },
                    ],
                },
            });
            await this.appendRow(sheetName, [
                'Work Date',
                'Work Start',
                'Break Start',
                'Work Duration',
                'Break Duration',
                'Total Work Hours',
                'Total Break Hours',
                'Total Work Day Duration'
            ]);
        }
    }

    async appendRow(sheetName, values = []) {
        const { auth, spreadsheetId } = this;
        const googleSheets = await this.getSheets();

        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: `${sheetName}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values],
            },
        });
    }

    async getRows(sheetName) {
        const { auth, spreadsheetId } = this;
        const googleSheets = await this.getSheets();
        const rows = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}`,
        })

        return rows.data.values;
    }

    async submitWorkTracking(isWorking) {
        const sheetName = dayjs().add(1, 'month').format('MM.YYYY');
        const date = dayjs().format('DD.MM.YYYY');
        const time = dayjs().format('HH:mm:ss');
        await this.createSheetIfNotExists(sheetName);

        if (isWorking) {
            await this.appendRow(`${sheetName}`, [date, time]);
        } else {
            const allRows = await this.getRows(sheetName);
            const count = allRows.length;
            const workDurationFormula = `=C${count}-B${count}`;
            const breakDurationFormula = count !== 2 ? `=B${count}-C${count - 1}` : '00:00:00';
            const totalWorkHoursFormula = `=SUM(D2:D${count})`;
            const totalBreakHoursFormula = `=SUM(E3:E${count})`;
            const totalWorkDayDurationFormula = `=C${count}-B2`;

            await this.appendRow(
                `${sheetName}!C${count}:C`,
                [
                    time,
                    workDurationFormula,
                    breakDurationFormula,
                    totalWorkHoursFormula,
                    totalBreakHoursFormula,
                    totalWorkDayDurationFormula
                ]
            );
        }
        const rows = await this.getRows(sheetName);
        console.log(rows);
    }
}

// const googleSheets = new GoogleSheets();
//
// googleSheets.submitWorkTracking(false);

module.exports = GoogleSheets;



