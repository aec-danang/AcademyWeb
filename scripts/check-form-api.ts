import { google } from 'googleapis';
import 'dotenv/config';
import * as fs from 'fs';

const TOKEN_PATH = "e:/AEC/google-form-import-test/token.json";
const CREDENTIALS_PATH = "e:/AEC/google-form-import-test/credentials.json";

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
  return oAuth2Client;
}

async function main() {
  const auth = await getAuth();

  const forms = google.forms({
    version: 'v1',
    auth: auth,
  });

  const formId = '1XmskXRctByIi5altmKLuhISMW0T0s9ZdlTIlkgJ-1PY'; // LG2_U4_Review_Vocab
  const res = await forms.forms.get({ formId });
  
  console.log(`Title: ${res.data.info?.title}`);
  const items = res.data.items || [];
  console.log(`Total items: ${items.length}`);
  
  for (const item of items) {
    if (item.questionItem) {
      console.log(`- Q: ${item.title} (QuestionItem)`);
    } else if (item.questionGroupItem) {
      console.log(`- Group: ${item.title} (QuestionGroupItem)`);
    } else if (item.imageItem) {
      console.log(`- Image: ${item.title} (ImageItem, URI: ${item.imageItem.image?.contentUri})`);
    } else if (item.textItem) {
      console.log(`- Text: ${item.title} (TextItem)`);
    } else if (item.videoItem) {
      console.log(`- Video: ${item.title} (VideoItem)`);
    } else {
      console.log(`- Unknown Item: ${item.title}`);
    }
  }
}

main().catch(console.error);
