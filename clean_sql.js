const fs = require('fs');
const readline = require('readline');

const inputFile = 'e:\\AEC\\academy_wp914.sql';
const outputFile = 'e:\\AEC\\academy_wp914_clean_full.sql';

const importantTables = [
  'wpuw_users', 'wpuw_usermeta',
  'wpuw_posts', 'wpuw_postmeta',
  'wpuw_terms', 'wpuw_termmeta', 'wpuw_term_relationships', 'wpuw_term_taxonomy',
  'wpuw_learnpress_sections', 'wpuw_learnpress_section_items', 
  'wpuw_learnpress_quiz_questions', 'wpuw_learnpress_question_answers', 
  'wpuw_learnpress_user_items', 'wpuw_learnpress_user_itemmeta',
  'wpuw_woocommerce_order_items', 'wpuw_woocommerce_order_itemmeta',
  'wpuw_wpforms_entries', 'wpuw_wpforms_entry_fields',
  'wpuw_wof_optins', 'wpuw_wof_lite_optins',
  'wpuw_options',
  // --- THÊM CÁC BẢNG QUIZ MASTER ---
  'wpuw_mlw_quizzes', 'wpuw_mlw_questions', 'wpuw_mlw_results'
];

async function processLineByLine() {
  console.log("Đang bắt đầu đọc file SQL 608MB để lấy toàn bộ dữ liệu...");
  const fileStream = fs.createReadStream(inputFile, { encoding: 'utf8' });
  const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let keepingData = true;

  for await (const line of rl) {
    const tableMatch = line.match(/(?:TABLE IF EXISTS|CREATE TABLE|LOCK TABLES|INSERT INTO|ALTER TABLE|Dumping data for table) `([^`]+)`/);
    
    if (tableMatch) {
      const tableName = tableMatch[1];
      keepingData = importantTables.includes(tableName);
    } else if (line.startsWith('-- Table structure for table')) {
        const tMatch = line.match(/`([^`]+)`/);
        if (tMatch) keepingData = importantTables.includes(tMatch[1]);
    } else if (line.startsWith('/*!') && !line.includes('`')) {
        keepingData = true;
    }

    if (keepingData) {
        writeStream.write(line + '\n');
    }
  }
  
  console.log(`Đã hoàn tất bóc tách dữ liệu! File Full lưu tại: ${outputFile}`);
}

processLineByLine().catch(err => console.error(err));
