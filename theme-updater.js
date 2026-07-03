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
  
  // Replace slates with grays
  content = content.replace(/slate-950/g, 'gray-950');
  content = content.replace(/slate-900/g, 'gray-900');
  content = content.replace(/slate-800/g, 'gray-800');
  content = content.replace(/slate-500/g, 'gray-500');
  content = content.replace(/slate-400/g, 'gray-400');
  content = content.replace(/slate-300/g, 'gray-300');
  content = content.replace(/slate-200/g, 'gray-200');
  content = content.replace(/slate-100/g, 'gray-100');
  
  // Replace indigos (the main theme color I used) with green
  content = content.replace(/indigo-600/g, 'green-600');
  content = content.replace(/indigo-500/g, 'green-500');
  content = content.replace(/indigo-400/g, 'green-400');
  content = content.replace(/indigo-300/g, 'green-300');

  // Also replace some emeralds with green, but leave amber for warnings.
  // Actually, I'll just leave emeralds alone, they are already a type of green!
  // I will just change all primary buttons (indigo) to green.

  fs.writeFileSync(file, content);
});

console.log("Theme updated to Gray and Light Green.");
