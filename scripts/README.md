# AcademyWeb Scripts

This directory contains utility scripts for database maintenance, data migration, and importing Google Forms.

## Requirements

Many of these scripts interact with the Google Drive and Google Forms APIs. To use them, you must authenticate.

1. Obtain a `credentials.json` file for an OAuth 2.0 Client ID from your Google Cloud Console.
2. Put `credentials.json` at the root of the project, or specify `GOOGLE_CREDENTIALS_PATH` in your `.env` file.
3. On the first run of a script (like `test-drive.ts`), the Google API client will prompt you to authorize and it will generate a `token.json` file. Put `token.json` at the root of the project, or specify `GOOGLE_TOKEN_PATH` in your `.env` file.

Alternatively, you can place these files anywhere on your machine and set the absolute paths in your `.env` file:
```env
GOOGLE_CREDENTIALS_PATH=/absolute/path/to/credentials.json
GOOGLE_TOKEN_PATH=/absolute/path/to/token.json
```

## Available Scripts

### Form Inspection & Import
- `npx tsx scripts/import-forms.ts <path-to-excel-file>`
  Imports multiple Google Forms mapped by a tracking Excel file into the database.
- `npx tsx scripts/inspect-form.ts [formId]`
  Fetches a single Google Form and saves its raw JSON output to `form_raw.json` for debugging.
- `npx tsx scripts/compare-form.ts [formId]`
  Compares a form's data with an existing quiz in the local Prisma DB.
- `npx tsx scripts/check-form-api.ts [formId]`
  Validates if a given form can be read properly via the API and lists its items.

### Other Utilities
- `npx tsx scripts/test-drive.ts`
  Tests authentication with Google Drive and lists 10 forms to confirm access.
- `npx tsx scripts/clean-survey-questions.ts`
  Cleans out redundant survey/personal info questions from imported quizzes.
- `npx tsx scripts/backfill-form-images.ts`
  Downloads images from Google Drive for previously imported forms.

## Usage Note
Since these scripts are written in TypeScript, run them using `npx tsx <script-name>` or `npm run tsx <script-name>` from the root of the project.
