#!/usr/bin/env node

// Script to fix all import paths in server files

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const serverSrcDir = 'F:/Havoc-Speedway/server/src';

function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Replace @havoc-speedway/shared imports with relative paths
    content = content.replace(
      /from ['"]@havoc-speedway\/shared['"];?/g,
      "from '../../../shared/src/index.js';"
    );
    
    writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const items = readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = join(dirPath, item);
    const stat = statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (item.endsWith('.ts')) {
      processFile(itemPath);
    }
  }
}

console.log('🔧 Fixing server import paths...');
processDirectory(serverSrcDir);
console.log('✅ All imports fixed!');
