import {
  cpSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  mkdirSync,
  existsSync,
  rmSync,
} from 'fs';
import { resolve, dirname, relative, join } from 'path';
import { fileURLToPath } from 'url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(scriptPath);
const rootDir = resolve(scriptDir, '..');
const srcDir = resolve(rootDir, 'src');
const distDir = resolve(rootDir, 'dist');

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function rewriteImports(content, filePath) {
  const dir = dirname(filePath);

  return content
    .replace(/from\s+['"]@\/([^'"]+)['"]/g, (match, importPath) => {
      const importFile = join(srcDir, importPath);
      let relPath = relative(dir, importFile);

      if (!relPath.startsWith('.')) {
        relPath = `./${relPath}`;
      }

      if (!relPath.endsWith('.js') && !relPath.endsWith('.tsx') && !relPath.endsWith('.ts')) {
        if (existsSync(`${importFile}.tsx`)) {
          relPath += '.tsx';
        } else if (existsSync(`${importFile}.ts`)) {
          relPath += '.ts';
        } else if (existsSync(`${importFile}.js`)) {
          relPath += '.js';
        }
      }

      return `from '${relPath}'`;
    })
    .replace(/import\s+\(['"]@\/([^'"]+)['"]\)/g, (match, importPath) => {
      const importFile = join(srcDir, importPath);
      let relPath = relative(dir, importFile);

      if (!relPath.startsWith('.')) {
        relPath = `./${relPath}`;
      }

      if (!relPath.endsWith('.js') && !relPath.endsWith('.tsx') && !relPath.endsWith('.ts')) {
        if (existsSync(`${importFile}.tsx`)) {
          relPath += '.tsx';
        } else if (existsSync(`${importFile}.ts`)) {
          relPath += '.ts';
        } else if (existsSync(`${importFile}.js`)) {
          relPath += '.js';
        }
      }

      return `import('${relPath}')`;
    });
}

function getOutputPath(srcPath) {
  const relativePath = relative(srcDir, srcPath);
  return join(distDir, relativePath);
}

function processDir(src, dest) {
  ensureDir(dest);
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      processDir(srcPath, destPath);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      if (
        entry.endsWith('.test.ts') ||
        entry.endsWith('.test.tsx') ||
        entry.endsWith('.stories.tsx')
      ) {
        continue;
      }
      const finalDestPath = getOutputPath(srcPath);
      let content = readFileSync(srcPath, 'utf-8');
      content = rewriteImports(content, srcPath);
      writeFileSync(finalDestPath, content);
    } else if (entry.endsWith('.mdx')) {
      continue;
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

console.log('Building @lunaria/ui...');

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

processDir(srcDir, distDir);

console.log('Built @lunaria/ui to dist/');
