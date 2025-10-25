#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Build script for compiling Cline proto files
 * This script uses the Cline submodule's build system to generate TypeScript gRPC clients
 */

const CLINE_DIR = path.resolve(__dirname, '../cline');
const GRPC_CLIENT_DIR = path.resolve(__dirname, '../packages/grpc-client');

function log(message) {
  console.log(`📦 [Proto Build] ${message}`);
}

function error(message) {
  console.error(`❌ [Proto Build] ${message}`);
}

function checkClineSubmodule() {
  if (!fs.existsSync(CLINE_DIR)) {
    error('Cline submodule not found. Please run: git submodule update --init --recursive');
    process.exit(1);
  }
  
  if (!fs.existsSync(path.join(CLINE_DIR, 'package.json'))) {
    error('Cline submodule appears to be empty. Please check the submodule configuration.');
    process.exit(1);
  }
  
  log('Cline submodule found');
}

function installClineDependencies() {
  log('Installing Cline dependencies...');
  try {
    execSync('npm install', { 
      cwd: CLINE_DIR,
      stdio: 'inherit'
    });
    log('Cline dependencies installed successfully');
  } catch (err) {
    error('Failed to install Cline dependencies');
    process.exit(1);
  }
}

function buildProtoFiles() {
  log('Building proto files...');
  try {
    execSync('npm run protos', { 
      cwd: CLINE_DIR,
      stdio: 'inherit'
    });
    log('Proto files built successfully');
  } catch (err) {
    error('Failed to build proto files');
    process.exit(1);
  }
}

function copyGeneratedClients() {
  log('Copying generated TypeScript clients...');
  
  const generatedDirs = [
    'src/generated/grpc-js',
    'src/generated/nice-grpc',
    'src/shared/proto'
  ];
  
  const targetDir = path.join(GRPC_CLIENT_DIR, 'src/generated');
  
  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  for (const dir of generatedDirs) {
    const sourceDir = path.join(CLINE_DIR, dir);
    const targetSubDir = path.join(targetDir, path.basename(dir));
    
    if (fs.existsSync(sourceDir)) {
      log(`Copying ${path.basename(dir)}...`);
      
      // Remove existing directory
      if (fs.existsSync(targetSubDir)) {
        fs.rmSync(targetSubDir, { recursive: true });
      }
      
      // Copy directory
      copyDir(sourceDir, targetSubDir);
    }
  }
  
  log('Generated clients copied successfully');
}

/**
 * WORKAROUND: Export MessageFns from common.ts files
 * This fixes TypeScript compilation errors caused by duplicate MessageFns interfaces
 * in generated proto files that aren't properly exported
 */
function exportMessageFnsFromCommonFiles() {
  log('Exporting MessageFns from common.ts files...');
  
  const generatedDir = path.join(GRPC_CLIENT_DIR, 'src/generated');
  const commonFiles = findCommonFiles(generatedDir);
  
  for (const file of commonFiles) {
    addExportToMessageFns(file);
  }
  
  log('MessageFns exports added to common.ts files');
}

/**
 * Find all common.ts files in the generated directory
 */
function findCommonFiles(dir) {
  const commonFiles = [];
  
  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file === 'common.ts') {
        commonFiles.push(filePath);
      }
    }
  }
  
  walk(dir);
  return commonFiles;
}

/**
 * WORKAROUND: Add export to MessageFns interface in common.ts files
 * This is needed because generated proto files have duplicate MessageFns interfaces
 * that aren't properly exported, causing TypeScript errors
 */
function addExportToMessageFns(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // WORKAROUND: Add export to MessageFns interface to fix TypeScript compilation
  // This is a temporary fix until proto generation is improved
  content = content.replace(
    /interface MessageFns<T> {/g,
    '// WORKAROUND: Export MessageFns to fix TypeScript compilation\n' +
    '// This is a temporary fix until proto generation is improved\n' +
    'export interface MessageFns<T> {'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function copyDir(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function main() {
  log('Starting proto build process...');
  
  try {
    checkClineSubmodule();
    installClineDependencies();
    buildProtoFiles();
    copyGeneratedClients();
    
    // WORKAROUND: Export MessageFns from common.ts files
    // This fixes TypeScript compilation errors caused by duplicate interfaces
    exportMessageFnsFromCommonFiles();
    
    log('Proto build completed successfully!');
    log('Generated TypeScript clients are available in packages/grpc-client/src/generated/');
  } catch (err) {
    error('Proto build failed');
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
