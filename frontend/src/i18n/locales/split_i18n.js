const fs = require('fs');

const content = fs.readFileSync('zh-CN.ts', 'utf-8');
const lines = content.split('\n');

// 找到所有顶级键的位置
const topLevelKeys = [];
for (let i = 1; i < lines.length - 1; i++) {
  const match = lines[i].match(/^  ([a-zA-Z]+): \{/);
  if (match) {
    topLevelKeys.push({ name: match[1], line: i });
  }
}

console.log(`找到 ${topLevelKeys.length} 个顶级键:`);
topLevelKeys.forEach(({ name, line }) => console.log(`  ${line}: ${name}`));

// 提取每个模块的内容
const modules = {};
for (let i = 0; i < topLevelKeys.length; i++) {
  const startLine = topLevelKeys[i].line;
  const endLine = i < topLevelKeys.length - 1 ? topLevelKeys[i + 1].line - 1 : lines.length - 2;
  
  const moduleLines = lines.slice(startLine, endLine + 1);
  const moduleContent = moduleLines.join('\n');
  
  // 提取对象内容（去掉键名和冒号）
  const match = moduleContent.match(/^\s*[a-zA-Z]+\s*:\s*(\{[\s\S]*\}),?\s*$/);
  if (match) {
    modules[topLevelKeys[i].name] = match.group(1) || match[1];
  } else {
    // 备用方法
    const objStart = moduleContent.indexOf('{');
    const objEnd = moduleContent.lastIndexOf('}');
    if (objStart !== -1 && objEnd !== -1) {
      modules[topLevelKeys[i].name] = moduleContent.substring(objStart, objEnd + 1);
    }
  }
}

console.log(`\n提取了 ${Object.keys(modules).length} 个模块`);
