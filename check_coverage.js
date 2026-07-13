import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const jsonDir = 'c:/Users/Ly Nghia/Downloads/drive-download-20260626T131339Z-3-001';
const excelFile = 'e:/AEC/Quản lý Progress Test (1).xlsx';

async function checkCoverage() {
  console.log("Đang đọc các file JSON...");
  const jsonFiles = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
  
  let allExtractedForms = [];
  
  for (const file of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(jsonDir, file), 'utf-8'));
    allExtractedForms = allExtractedForms.concat(data);
  }
  
  console.log(`Đã đọc ${allExtractedForms.length} Google Forms từ file JSON.`);
  
  console.log("Đang đọc file Excel...");
  const workbook = xlsx.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Headers in Excel: Chương trình, Giáo trình, Progress Test, Link Đề thi
  let excelForms = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length === 0) continue;
    const program = row[0];
    const curriculum = row[1];
    const testTitle = row[2];
    const link = row[3];
    
    if (testTitle && link) {
      excelForms.push({
        program,
        curriculum,
        title: testTitle.toString().trim(),
        link: link.toString().trim()
      });
    }
  }
  
  console.log(`Đã đọc ${excelForms.length} bài test từ Excel.`);
  
  // Normalize titles for comparison
  const normalize = (str) => {
    if (!str) return '';
    return str.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  
  const extractedTitlesMap = new Map();
  allExtractedForms.forEach(form => {
    extractedTitlesMap.set(normalize(form.title), form);
  });
  
  let matchCount = 0;
  let missing = [];
  
  for (const exForm of excelForms) {
    const normTitle = normalize(exForm.title);
    if (extractedTitlesMap.has(normTitle)) {
      matchCount++;
    } else {
      // Try partial match
      let found = false;
      for (const extracted of allExtractedForms) {
        if (normalize(extracted.title).includes(normTitle) || normTitle.includes(normalize(extracted.title))) {
          matchCount++;
          found = true;
          break;
        }
      }
      if (!found) {
        missing.push(exForm);
      }
    }
  }
  
  console.log(`\nKết quả so khớp:`);
  console.log(`- Trùng khớp: ${matchCount} / ${excelForms.length}`);
  console.log(`- Không tìm thấy (Missing): ${missing.length}`);
  
  if (missing.length > 0) {
    console.log(`\nVí dụ 10 bài test bị thiếu (không khớp tên):`);
    missing.slice(0, 10).forEach(m => {
      console.log(`  [${m.program} - ${m.curriculum}] ${m.title} (${m.link})`);
    });
  }
}

checkCoverage().catch(console.error);
