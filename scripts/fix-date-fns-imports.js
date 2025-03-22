#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * This script helps to find and fix date-fns import issues
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const rootDir = path.join(__dirname, '..');

// Path patterns to ignore
const ignorePaths = [
  'node_modules',
  '.next',
  '.git',
  'scripts',
];

// Find all .tsx and .ts files
async function findTsFiles(dir) {
  const files = [];
  
  const items = await readdir(dir);
  
  for (const item of items) {
    if (ignorePaths.some(ignore => item.includes(ignore))) {
      continue;
    }
    
    const fullPath = path.join(dir, item);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      const subFiles = await findTsFiles(fullPath);
      files.push(...subFiles);
    } else if (
      stats.isFile() && 
      (item.endsWith('.ts') || item.endsWith('.tsx'))
    ) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Check and fix date-fns imports
async function fixDateFnsImports(files) {
  console.log(`Checking ${files.length} TypeScript files for date-fns imports...`);
  
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf8');
      
      // Check for problematic import patterns
      const wrongImport = /from ['"]date-fns\/esm/;
      const nestedImport = /from ['"]date-fns\/(.*?)['"][;]/;
      
      if (wrongImport.test(content) || nestedImport.test(content)) {
        console.log(`Fixing imports in ${file}`);
        
        // Replace problematic imports with direct imports
        let fixedContent = content
          .replace(/from ['"]date-fns\/esm\/(.*?)['"][;]/g, 'from \'date-fns\';')
          .replace(/from ['"]date-fns\/(.*?)['"][;]/g, 'from \'date-fns\';');
        
        await writeFile(file, fixedContent, 'utf8');
        fixedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  return fixedFiles;
}

// Main execution
async function main() {
  try {
    console.log('Searching for TypeScript files...');
    const files = await findTsFiles(rootDir);
    console.log(`Found ${files.length} TypeScript files`);
    
    const fixedFiles = await fixDateFnsImports(files);
    
    if (fixedFiles > 0) {
      console.log(`\n✅ Fixed date-fns imports in ${fixedFiles} files`);
    } else {
      console.log('\n✅ No problematic date-fns imports found!');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();