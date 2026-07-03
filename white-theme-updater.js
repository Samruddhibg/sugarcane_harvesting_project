const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Backgrounds: Dark Gray -> White / Light Green
  content = content.replace(/bg-gray-950/g, 'bg-white');
  content = content.replace(/bg-gray-900/g, 'bg-green-50');
  
  // Borders: Dark Gray -> Light Green
  content = content.replace(/border-gray-800/g, 'border-green-200');
  content = content.replace(/bg-gray-800/g, 'border-green-200'); // Some elements used bg-gray-800, change to border-green-200 or bg-green-100
  
  // Text colors for headings and paragraphs
  // I must be careful not to replace text-white inside buttons.
  // Buttons usually look like: "text-white font-bold py-3" or "text-white text-xs".
  // Let's manually fix buttons if they break, or replace specific text elements:
  content = content.replace(/text-gray-500/g, 'text-green-600');
  content = content.replace(/text-gray-400/g, 'text-green-700');
  content = content.replace(/text-gray-300/g, 'text-green-800');
  
  // Headings usually have `text-white` but are not buttons.
  content = content.replace(/text-white tracking-tight/g, 'text-green-950 tracking-tight');
  content = content.replace(/text-white focus/g, 'text-green-900 focus');
  content = content.replace(/text-white outline-none/g, 'text-green-900 outline-none');

  fs.writeFileSync(file, content);
});

console.log("Theme updated to White and Light Green.");
