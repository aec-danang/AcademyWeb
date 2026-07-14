import 'dotenv/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import { getGoogleAuth } from './form-import-utils';

async function main() {
    const auth = await getGoogleAuth();
    const formId = process.argv[2] || '1dnAeIFNvCBSZM9JE5iM7L9hg_7vZamaEr7Oe0HZ8Afs';
    const forms = google.forms({ version: "v1", auth });
    const res = await forms.forms.get({ formId });
    
    // Save the raw JSON to a file
    fs.writeFileSync('form_raw.json', JSON.stringify(res.data, null, 2));
    console.log("Raw form data saved to form_raw.json");
    
    // Check for options with images
    let optionImagesCount = 0;
    for (const item of (res.data.items || [])) {
        const q = item.questionItem?.question;
        if (q?.choiceQuestion) {
            for (const opt of q.choiceQuestion.options || []) {
                if ((opt as any).image?.contentUri || (opt as any).image) {
                    optionImagesCount++;
                    console.log(`Found image on option: ${opt.value}`);
                }
            }
        }
    }
    console.log(`Total images on options: ${optionImagesCount}`);
}

main().catch(console.error);
