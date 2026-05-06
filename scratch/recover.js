const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\ihave\\.gemini\\antigravity\\brain\\6cc96f78-4fdf-4a51-a6f3-c0ec6d618794\\.system_generated\\logs\\overview.txt';
const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.source === 'USER_EXPLICIT' && entry.type === 'CODE_ACTION') {
      const content = entry.content;
      const match = content.match(/changes were made by the USER to: (.*?)\. If/);
      if (match) {
        const filePath = match[1];
        console.log('Found CODE_ACTION for', filePath, 'at step', entry.step_index);
        
        const diffStart = content.indexOf('[diff_block_start]');
        const diffEnd = content.indexOf('[diff_block_end]');
        if (diffStart !== -1 && diffEnd !== -1) {
          const diff = content.substring(diffStart, diffEnd);
          const diffLines = diff.split('\n');
          let isFullReplacement = false;
          let recoveredLines = [];
          
          for (let i = 0; i < diffLines.length; i++) {
            const dl = diffLines[i];
            if (dl.startsWith('@@ ') && dl.includes('@@')) {
              if (dl.includes('-1,') && dl.includes('+1,')) {
                isFullReplacement = true;
              }
            } else if (isFullReplacement) {
              if (dl.startsWith('+') && !dl.startsWith('+++')) {
                recoveredLines.push(dl.substring(1));
              } else if (dl.startsWith(' ') || dl === '') {
                 recoveredLines.push(dl ? dl.substring(1) : '');
              }
            }
          }
          
          if (isFullReplacement && recoveredLines.length > 0) {
            const outPath = path.join(__dirname, path.basename(filePath) + '.txt');
            fs.writeFileSync(outPath, recoveredLines.join('\n'));
            console.log('Recovered to', outPath, 'lines:', recoveredLines.length);
          }
        }
      }
    }
  } catch (e) {
  }
}
