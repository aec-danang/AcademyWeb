import 'dotenv/config';
import { google } from 'googleapis';
import { getGoogleAuth } from './form-import-utils';

async function main() {
    const auth = await getGoogleAuth();

    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.form'",
        pageSize: 10,
        fields: 'files(id, name)',
    });
    console.log(res.data.files);
}

main().catch(console.error);
