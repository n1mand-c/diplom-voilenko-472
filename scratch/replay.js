const fs = require('fs');
const path = require('path');

const logs = [
  'C:\\Users\\ihave\\.gemini\\antigravity\\brain\\2b10cc9a-274f-4dfb-99e5-7045d7c7758f\\.system_generated\\logs\\overview.txt',
  'C:\\Users\\ihave\\.gemini\\antigravity\\brain\\24e162b5-19af-4276-a684-564a369fee5a\\.system_generated\\logs\\overview.txt'
];

let filesState = {};

function applyReplacement(content, target, replacement, allowMultiple) {
  if (!content.includes(target)) {
    console.warn("  Target not found in file!");
    return content;
  }
  if (allowMultiple) {
    return content.split(target).join(replacement);
  } else {
    return content.replace(target, replacement);
  }
}

for (const logPath of logs) {
  if (!fs.existsSync(logPath)) {
    console.log("Log not found:", logPath);
    continue;
  }
  console.log("Processing", logPath);
  const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.source === 'MODEL' && entry.tool_calls) {
        for (const call of entry.tool_calls) {
          const args = call.args || {};
          let targetFile = args.TargetFile;
          
          if (!targetFile && call.name.includes('file')) continue;
          
          if (targetFile) {
            targetFile = targetFile.replace(/\\/g, '/').replace(/"/g, '');
            // ensure it points to the workspace
            if (targetFile.includes('red-bull-hotel22') && !targetFile.includes('.gemini')) {
               const relative = targetFile.substring(targetFile.indexOf('red-bull-hotel22') + 17);
               const absPath = path.join('C:\\Users\\ihave\\Desktop\\777\\red-bull-hotel22', relative);
               
               if (!filesState[absPath]) {
                 if (fs.existsSync(absPath)) {
                   filesState[absPath] = fs.readFileSync(absPath, 'utf8');
                 } else {
                   filesState[absPath] = "";
                 }
               }
               
               if (call.name === 'write_to_file') {
                 console.log(`[write_to_file] ${relative}`);
                 filesState[absPath] = args.CodeContent || "";
               } else if (call.name === 'replace_file_content') {
                 console.log(`[replace_file_content] ${relative}`);
                 filesState[absPath] = applyReplacement(filesState[absPath], args.TargetContent, args.ReplacementContent, args.AllowMultiple);
               } else if (call.name === 'multi_replace_file_content') {
                 console.log(`[multi_replace_file_content] ${relative}`);
                 const chunks = typeof args.ReplacementChunks === 'string' ? JSON.parse(args.ReplacementChunks) : args.ReplacementChunks;
                 if (chunks && Array.isArray(chunks)) {
                   for (const chunk of chunks) {
                     filesState[absPath] = applyReplacement(filesState[absPath], chunk.TargetContent, chunk.ReplacementContent, chunk.AllowMultiple);
                   }
                 }
               }
            }
          }
        }
      }
    } catch(e) {}
  }
}

// Write everything to scratch/restore to review
const restoreDir = path.join(__dirname, 'restore');
if (!fs.existsSync(restoreDir)) fs.mkdirSync(restoreDir);

for (const f in filesState) {
  const relative = f.substring(f.indexOf('red-bull-hotel22') + 17);
  const outPath = path.join(restoreDir, relative.replace(/[\/\\]/g, '_'));
  fs.writeFileSync(outPath, filesState[f]);
}
console.log("Done! Check scratch/restore folder.");
