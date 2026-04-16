const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'backend/node_modules/.bin'),
  path.join(__dirname, 'frontend/node_modules/.bin')
];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          // Replace specific comment lines
          content = content.replace(/^[ \t]*# Fix case when both the Windows and Linux builds of Node\r?\n/gm, '');
          content = content.replace(/^[ \t]*# are installed in the same directory\r?\n/gm, '');
          content = content.replace(/^[ \t]*# Support pipeline input\r?\n/gm, '');
          
          fs.writeFileSync(filePath, content, 'utf8');
        } catch (e) {
          // ignore binary files or read errors
        }
      }
    });
  }
});
console.log('Removed comments from .bin wrappers.');
