const fs = require('fs-extra'); // Use fs-extra for easier copying
const path = require('path');

const pyodidePackageDir = path.dirname(require.resolve('pyodide/package.json'));
// Target directory in public remains the same
const targetDir = path.join(__dirname, '..', 'public', 'pyodide'); 

console.log(`Source Pyodide package directory: ${pyodidePackageDir}`);
console.log(`Target directory: ${targetDir}`);

// List of essential files to copy from the root of the pyodide package
const filesToCopy = [
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'package.json',
  'pyodide-lock.json',
  // Add other files if needed, e.g., specific .so files for built-in packages
];

try {
  // Ensure target directory exists
  fs.ensureDirSync(targetDir);

  console.log('Copying essential Pyodide files...');

  filesToCopy.forEach(file => {
    const sourceFile = path.join(pyodidePackageDir, file);
    const targetFile = path.join(targetDir, file);

    if (fs.existsSync(sourceFile)) {
      console.log(`Copying ${file}...`);
      fs.copySync(sourceFile, targetFile, { overwrite: true });
    } else {
      console.warn(`Warning: Source file not found, skipping: ${sourceFile}`);
    }
  });

  console.log('Pyodide files copied successfully to public/pyodide!');

} catch (err) {
  console.error('Error copying Pyodide files:', err);
  process.exit(1); // Exit with error code
}