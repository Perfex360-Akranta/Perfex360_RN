const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'node_modules', '.bin');
if (!fs.existsSync(binDir)) {
  process.exit(0);
}

const ocrGradle = path.join(
  __dirname,
  '..',
  'node_modules',
  '@dariyd',
  'react-native-text-recognition',
  'android',
  'build.gradle',
);
if (fs.existsSync(ocrGradle)) {
  const gradle = fs.readFileSync(ocrGradle, 'utf8');
  const fixedGradle = gradle.replace(
    'url = uri("file://${projectDir}/maven")',
    'url = new File(projectDir, "maven").toURI()',
  );
  if (fixedGradle !== gradle) {
    fs.writeFileSync(ocrGradle, fixedGradle);
  }
}

for (const name of fs.readdirSync(binDir)) {
  if (!name.endsWith('.cmd')) {
    continue;
  }
  const filePath = path.join(binDir, name);
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = original.replace(/SET dp0=%~dp0/g, 'SET "dp0=%~dp0"');
  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
  }
}
