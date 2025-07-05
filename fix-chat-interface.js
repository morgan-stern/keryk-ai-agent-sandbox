const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

// Remove the "No newline at end of file" text
content = content.replace(/\n\s*No newline at end of file\n/g, '\n');

// Fix the modal placement - move it inside the main div
content = content.replace(
  /(\s*<\/>\s*\)\s*}\s*<\/div>\s*)({\s*\/\*\s*Agent Configuration Modal\s*\*\/})/,
  '$1\n\n      $2'
);

// Ensure the modal is inside the main component div
const lines = content.split('\n');
let mainDivCount = 0;
let fixedLines = [];
let inModal = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('return (')) {
    mainDivCount = 1;
  }
  
  if (line.includes('{/* Agent Configuration Modal */}')) {
    inModal = true;
    // Insert the modal before the closing div
    fixedLines.splice(fixedLines.length - 1, 0, '\n      ' + line);
    continue;
  }
  
  if (inModal && line.trim() === ')}' && lines[i+1] && lines[i+1].trim() === '</div>') {
    fixedLines.push(line);
    fixedLines.push(lines[++i]); // Add the closing div
    inModal = false;
    continue;
  }
  
  fixedLines.push(line);
}

// Write the fixed content
fs.writeFileSync('src/components/ChatInterface.tsx', fixedLines.join('\n'));
console.log('Fixed ChatInterface.tsx');
