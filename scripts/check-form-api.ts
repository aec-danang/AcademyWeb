import { google } from 'googleapis';
import 'dotenv/config';
import * as fs from 'fs';
import { getGoogleAuth } from './form-import-utils';

async function main() {
  const auth = await getGoogleAuth();

  const forms = google.forms({
    version: 'v1',
    auth: auth,
  });

  const formId = process.argv[2] || '1XmskXRctByIi5altmKLuhISMW0T0s9ZdlTIlkgJ-1PY'; // Default to LG2_U4_Review_Vocab
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
