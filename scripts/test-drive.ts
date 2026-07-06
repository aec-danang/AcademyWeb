import 'dotenv/config';
import { google } from 'googleapis';
import * as fs from 'fs';

const TOKEN_PATH = "e:/AEC/google-form-import-test/token.json";
const CREDENTIALS_PATH = "e:/AEC/google-form-import-test/credentials.json";

async function main() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));

    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.form'",
        pageSize: 10,
        fields: 'files(id, name)',
    });
    console.log(res.data.files);
}

main().catch(console.error);
