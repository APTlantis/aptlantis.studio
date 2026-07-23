# APT Themes (generated)

This extension packages the theme JSON files found in the parent folder.

To build a .vsix, install vsce or use npx vsce:

1. Run this generator: 

   node generate-vscode-extension.js

2. Change into the generated folder and package:

   cd apt-themes-extension
   npx vsce package

3. Install the resulting .vsix with the command line or via VS Code "Install from VSIX..."
