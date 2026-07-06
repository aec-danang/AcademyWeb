const XLSX = require('xlsx');

function readExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const result = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      // Get only the first 5 rows to understand the structure
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      result[sheetName] = data.slice(0, 5);
    });
    
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

readExcel('e:\\AEC\\Quản lý Progress Test (1).xlsx');
