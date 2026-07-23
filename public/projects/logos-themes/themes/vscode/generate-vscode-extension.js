const fs = require('fs');
const path = require('path');

const srcDir = __dirname; // this file lives in themes/vscode
const outDir = path.join(srcDir, 'apt-themes-extension');
const outThemesDir = path.join(outDir, 'themes');

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('No .json theme files found in', srcDir);
    process.exit(1);
  }

  safeMkdir(outThemesDir);

  const themes = files.map(fname => {
    const full = path.join(srcDir, fname);
    const json = readJson(full);
    const label = json.name || path.basename(fname, '.json');
    const uiTheme = (json.type && json.type.toLowerCase && json.type.toLowerCase().includes('light')) ? 'vs' : 'vs-dark';
    // copy theme file to out themes folder
    const dest = path.join(outThemesDir, fname);
    fs.copyFileSync(full, dest);
    return { label, uiTheme, path: `./themes/${fname}` };
  });

  const packageJson = {
    name: 'apt-themes',
    displayName: 'APT Themes (generated)',
    publisher: 'your-publisher',
    version: '0.0.1',
    engines: { vscode: '^1.60.0' },
    contributes: { themes }
  };

  fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  const readme = `# APT Themes (generated)\n\nThis extension packages the theme JSON files found in the parent folder.\n\nTo build a .vsix, install ` + "vsce" + ` or use ` + "npx vsce" + `:\n\n1. Run this generator: \n\n   node generate-vscode-extension.js\n\n2. Change into the generated folder and package:\n\n   cd apt-themes-extension\n   npx vsce package\n\n3. Install the resulting .vsix with the command line or via VS Code "Install from VSIX..."\n`;

  fs.writeFileSync(path.join(outDir, 'README.md'), readme);

  console.log('Generated extension scaffold at', outDir);
  console.log('Themes included:', themes.map(t => t.label).join(', '));
  console.log('\nNext: run the packaging commands in the README.');
}

main();
