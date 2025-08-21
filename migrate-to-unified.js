#!/usr/bin/env node

/**
 * Migration Script: Unify Web and Mobile Codebases
 *
 * This script migrates the existing web codebase to a shared structure
 * that can be used by both web and mobile platforms.
 *
 * Usage: node migrate-to-unified.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  webSrcDir: './src',
  sharedDir: './shared',
  mobileDir: './TenebrisOS-Native',
  backupDir: './backup-pre-migration',

  // Files to migrate
  directories: [
    'components',
    'pages',
    'contexts',
    'utils',
    'hooks',
    'firebase',
    'services'
  ],

  // Files that need platform-specific handling
  platformSpecificFiles: {
    'App.jsx': {
      web: './src/App.jsx',
      mobile: './TenebrisOS-Native/App.js',
      shared: './shared/App.jsx'
    },
    'main.jsx': {
      web: './src/main.jsx',
      mobile: './TenebrisOS-Native/index.js'
    }
  },

  // Import path mappings for web->shared conversion
  importMappings: {
    './components/': '../shared/components/',
    './pages/': '../shared/pages/',
    './contexts/': '../shared/contexts/',
    './utils/': '../shared/utils/',
    './hooks/': '../shared/hooks/',
    './firebase/': '../shared/firebase/',
    './services/': '../shared/services/',
    '../components/': '../shared/components/',
    '../pages/': '../shared/pages/',
    '../contexts/': '../shared/contexts/',
    '../utils/': '../shared/utils/',
    '../hooks/': '../shared/hooks/',
    '../firebase/': '../shared/firebase/',
    '../services/': '../shared/services/'
  }
};

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  step: (msg) => console.log(`\n🔄 ${msg}`)
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log.info(`Created directory: ${dir}`);
  }
};

const copyFile = (src, dest) => {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  log.info(`Copied: ${src} → ${dest}`);
};

const copyDirectory = (src, dest) => {
  if (!fs.existsSync(src)) {
    log.warning(`Source directory does not exist: ${src}`);
    return;
  }

  ensureDir(dest);

  const items = fs.readdirSync(src, { withFileTypes: true });

  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);

    if (item.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
};

const updateImports = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update relative imports to point to shared directory
  for (const [oldPath, newPath] of Object.entries(CONFIG.importMappings)) {
    const regex = new RegExp(`(import.*from\\s+['"])(${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `$1${newPath}`);
      updated = true;
    }
  }

  // Add platform utilities import if needed
  if (content.includes('localStorage') || content.includes('window.')) {
    const platformImport = "import { Platform, StorageUtils } from '../utils/platform.js';\n";
    if (!content.includes('from \'../utils/platform.js\'')) {
      content = platformImport + content;
      updated = true;
    }
  }

  // Replace web-specific patterns with universal components
  const replacements = [
    {
      pattern: /import\s+{\s*motion\s*}\s+from\s+['"]framer-motion['"];?/g,
      replacement: "import { UniversalView as motion } from '../components/Universal.jsx';"
    },
    {
      pattern: /<div\s+className=/g,
      replacement: '<UniversalView className='
    },
    {
      pattern: /<span\s+className=/g,
      replacement: '<UniversalText className='
    },
    {
      pattern: /localStorage\.getItem/g,
      replacement: 'await StorageUtils.getItem'
    },
    {
      pattern: /localStorage\.setItem/g,
      replacement: 'await StorageUtils.setItem'
    }
  ];

  for (const { pattern, replacement } of replacements) {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    log.info(`Updated imports in: ${filePath}`);
  }
};

const updateAllFilesInDirectory = (dir) => {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      updateAllFilesInDirectory(fullPath);
    } else if (item.name.endsWith('.jsx') || item.name.endsWith('.js')) {
      updateImports(fullPath);
    }
  }
};

const createPackageJsonUpdates = () => {
  // Update web package.json to use shared components
  const webPackagePath = './package.json';
  if (fs.existsSync(webPackagePath)) {
    const webPackage = JSON.parse(fs.readFileSync(webPackagePath, 'utf8'));

    // Add shared directory to module resolution
    if (!webPackage.imports) {
      webPackage.imports = {};
    }

    webPackage.imports = {
      ...webPackage.imports,
      '#shared/*': './shared/*',
      '#components/*': './shared/components/*',
      '#pages/*': './shared/pages/*',
      '#utils/*': './shared/utils/*'
    };

    fs.writeFileSync(webPackagePath, JSON.stringify(webPackage, null, 2));
    log.success('Updated web package.json with shared imports');
  }

  // Update mobile package.json
  const mobilePackagePath = './TenebrisOS-Native/package.json';
  if (fs.existsSync(mobilePackagePath)) {
    const mobilePackage = JSON.parse(fs.readFileSync(mobilePackagePath, 'utf8'));

    // Add dependencies that are needed for shared components
    const additionalDeps = {
      'react-router-dom': '^6.30.1',
      'framer-motion': '^11.0.0',
      'lucide-react': '^0.344.0'
    };

    mobilePackage.dependencies = {
      ...mobilePackage.dependencies,
      ...additionalDeps
    };

    // Add shared directory to module resolution
    if (!mobilePackage.imports) {
      mobilePackage.imports = {};
    }

    mobilePackage.imports = {
      ...mobilePackage.imports,
      '#shared/*': '../shared/*',
      '#components/*': '../shared/components/*',
      '#pages/*': '../shared/pages/*',
      '#utils/*': '../shared/utils/*'
    };

    fs.writeFileSync(mobilePackagePath, JSON.stringify(mobilePackage, null, 2));
    log.success('Updated mobile package.json with shared imports and dependencies');
  }
};

const createSymlinks = () => {
  // Create symlinks for easier development
  const symlinks = [
    {
      target: '../shared',
      link: './src/shared'
    },
    {
      target: '../shared',
      link: './TenebrisOS-Native/shared'
    }
  ];

  for (const { target, link } of symlinks) {
    try {
      if (fs.existsSync(link)) {
        fs.unlinkSync(link);
      }
      fs.symlinkSync(target, link, 'dir');
      log.success(`Created symlink: ${link} → ${target}`);
    } catch (error) {
      log.warning(`Could not create symlink ${link}: ${error.message}`);
    }
  }
};

const createWebEntryPoint = () => {
  const webEntryContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../shared/App.jsx';
import '../shared/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

  fs.writeFileSync('./src/main.jsx', webEntryContent);
  log.success('Created new web entry point');
};

const createMobileEntryPoint = () => {
  const mobileEntryContent = `import React from 'react';
import App from '../shared/App.jsx';

export default App;
`;

  fs.writeFileSync('./TenebrisOS-Native/App.js', mobileEntryContent);
  log.success('Created new mobile entry point');
};

const createViteConfig = () => {
  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#shared': '/shared',
      '#components': '/shared/components',
      '#pages': '/shared/pages',
      '#utils': '/shared/utils'
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});
`;

  fs.writeFileSync('./vite.config.js', viteConfigContent);
  log.success('Updated Vite config for shared directory access');
};

const createBabelConfig = () => {
  const babelConfigContent = `module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '#shared': '../shared',
          '#components': '../shared/components',
          '#pages': '../shared/pages',
          '#utils': '../shared/utils'
        }
      }
    ]
  ]
};
`;

  fs.writeFileSync('./TenebrisOS-Native/babel.config.js', babelConfigContent);
  log.success('Updated Babel config for shared directory access');
};

const generateMigrationReport = () => {
  const reportContent = `# Migration Report - Web to Unified Codebase

## Migration Completed: ${new Date().toISOString()}

### 📁 Directory Structure
- ✅ Created \`/shared\` directory
- ✅ Migrated components, pages, contexts, utils, hooks
- ✅ Updated import paths throughout codebase
- ✅ Created symlinks for development

### 🔧 Configuration Updates
- ✅ Updated package.json files with shared imports
- ✅ Updated Vite config for web build
- ✅ Updated Babel config for mobile build
- ✅ Created new entry points for both platforms

### 🚀 Next Steps

1. **Install dependencies:**
   \`\`\`bash
   npm install
   cd TenebrisOS-Native && npm install
   \`\`\`

2. **Test web build:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Test mobile build:**
   \`\`\`bash
   cd TenebrisOS-Native
   npx expo start
   \`\`\`

4. **Review and fix any remaining import issues**
5. **Test all features on both platforms**
6. **Update deployment scripts if needed**

### 📊 Migration Statistics
- Components migrated: ${fs.existsSync('./shared/components') ? fs.readdirSync('./shared/components').length : 0}
- Pages migrated: ${fs.existsSync('./shared/pages') ? fs.readdirSync('./shared/pages').length : 0}
- Utilities migrated: ${fs.existsSync('./shared/utils') ? fs.readdirSync('./shared/utils').length : 0}

### ⚠️ Known Issues
- Some components may need platform-specific styling adjustments
- Mobile navigation may need fine-tuning
- Performance optimizations may need review

### 🔄 Rollback Instructions
If you need to rollback this migration:
1. Restore from backup: \`cp -r backup-pre-migration/* ./\`
2. Remove shared directory: \`rm -rf shared\`
3. Remove symlinks: \`rm src/shared TenebrisOS-Native/shared\`
`;

  fs.writeFileSync('./MIGRATION_REPORT.md', reportContent);
  log.success('Generated migration report');
};

// Main migration function
const runMigration = async () => {
  try {
    log.step('Starting migration to unified codebase');

    // Step 1: Create backup
    log.step('Creating backup of current codebase');
    if (fs.existsSync(CONFIG.backupDir)) {
      execSync(`rm -rf ${CONFIG.backupDir}`);
    }
    ensureDir(CONFIG.backupDir);
    copyDirectory('./src', `${CONFIG.backupDir}/src`);
    copyDirectory('./TenebrisOS-Native', `${CONFIG.backupDir}/TenebrisOS-Native`);
    log.success('Backup created');

    // Step 2: Create shared directory structure
    log.step('Creating shared directory structure');
    ensureDir(CONFIG.sharedDir);
    for (const dir of CONFIG.directories) {
      ensureDir(path.join(CONFIG.sharedDir, dir));
    }

    // Step 3: Copy web components to shared
    log.step('Migrating web components to shared directory');
    for (const dir of CONFIG.directories) {
      const srcDir = path.join(CONFIG.webSrcDir, dir);
      const destDir = path.join(CONFIG.sharedDir, dir);

      if (fs.existsSync(srcDir)) {
        copyDirectory(srcDir, destDir);
      }
    }

    // Copy root files
    const rootFiles = ['App.jsx'];
    for (const file of rootFiles) {
      const srcFile = path.join(CONFIG.webSrcDir, file);
      const destFile = path.join(CONFIG.sharedDir, file);

      if (fs.existsSync(srcFile)) {
        copyFile(srcFile, destFile);
      }
    }

    // Copy styles
    if (fs.existsSync('./src/index.css')) {
      ensureDir('./shared/styles');
      copyFile('./src/index.css', './shared/styles/index.css');
    }

    log.success('Components migrated to shared directory');

    // Step 4: Update imports in shared files
    log.step('Updating import paths in shared files');
    updateAllFilesInDirectory(CONFIG.sharedDir);

    // Step 5: Update package.json files
    log.step('Updating package.json configurations');
    createPackageJsonUpdates();

    // Step 6: Create symlinks
    log.step('Creating development symlinks');
    createSymlinks();

    // Step 7: Create new entry points
    log.step('Creating platform-specific entry points');
    createWebEntryPoint();
    createMobileEntryPoint();

    // Step 8: Update build configurations
    log.step('Updating build configurations');
    createViteConfig();
    createBabelConfig();

    // Step 9: Generate migration report
    log.step('Generating migration report');
    generateMigrationReport();

    // Step 10: Success message
    log.success('\n🎉 Migration completed successfully!');
    log.info('\nNext steps:');
    log.info('1. Run: npm install');
    log.info('2. Run: cd TenebrisOS-Native && npm install');
    log.info('3. Test web: npm run dev');
    log.info('4. Test mobile: cd TenebrisOS-Native && npx expo start');
    log.info('5. Review MIGRATION_REPORT.md for details');

  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    log.error('Check the backup directory to restore if needed');
    process.exit(1);
  }
};

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, CONFIG };
