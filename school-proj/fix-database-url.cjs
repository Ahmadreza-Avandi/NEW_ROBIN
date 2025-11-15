const fs = require('fs');
const path = require('path');

const files = [
  'next/pages/api/classes.ts',
  'next/pages/api/grades.ts',
  'next/pages/api/majors.ts',
  'next/pages/api/subjects.ts',
  'next/pages/api/attendance.ts',
  'next/pages/api/class-subjects.ts',
  'next/pages/api/students-by-class.ts',
  'next/pages/api/compare-attendance-with-class-time.ts',
  'next/pages/api/add-subject-column.ts',
  'next/pages/api/user.view.ts',
  'next/pages/api/users/[id].ts',
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // حذف dbConfig
    content = content.replace(/const dbConfig = \{[\s\S]*?\};?\n/g, '');
    
    // جایگزینی dbConfig.connectionString با DATABASE_URL
    content = content.replace(/dbConfig\.connectionString/g, 'DATABASE_URL');
    
    // حذف console.log های اضافی
    content = content.replace(/\s*console\.log\('Connecting to database using:.*?\);?\n/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (err) {
    console.log(`⚠️  Skipped: ${file} (${err.message})`);
  }
});

console.log('\n✅ All files fixed!');
console.log('Now restart the server: npm run dev');
