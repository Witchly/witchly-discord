import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import Fuse from 'fuse.js';
import { logger } from './logger';

interface DocEntry {
  title: string;
  url: string;
  content: string; // Plain text snippet
}

export class DocIndexer {
  private entries: DocEntry[] = [];
  private fuse: Fuse<DocEntry> | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 Hour
  private readonly DOCS_PATH = path.join(process.cwd(), 'docs-cache');
  private readonly REPO_URL = 'https://github.com/Witchly/docs.git';
  private readonly BASE_DOCS_URL = 'https://docs.witchly.host';

  async fetchDocs() {
    // Refresh logic: Clone if missing, Pull if exists, or skip if fresh
    if (!fs.existsSync(this.DOCS_PATH)) {
      logger.info('Cloning docs repository...');
      try {
        execSync(`git clone ${this.REPO_URL} "${this.DOCS_PATH}"`, { stdio: 'ignore' });
      } catch (err) {
        logger.error(`Failed to clone docs: ${err}`);
        return;
      }
    } else if (Date.now() - this.lastFetch > this.CACHE_DURATION) {
      logger.info('Pulling latest docs...');
      try {
        execSync(`cd "${this.DOCS_PATH}" && git pull`, { stdio: 'ignore' });
      } catch (err) {
        logger.error(`Failed to pull docs: ${err}`);
      }
    } else if (this.entries.length > 0) {
      return; // Cache is fresh and loaded
    }

    // Indexing
    this.entries = [];
    this.walkDir(this.DOCS_PATH);

    this.fuse = new Fuse(this.entries, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'content', weight: 0.3 }
      ],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 3
    });

    this.lastFetch = Date.now();
    logger.success(`Indexed ${this.entries.length} doc pages from Git.`);
  }

  private walkDir(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (file === '.git') continue; // Ignore .git folder
        this.walkDir(filePath);
      } else if (file.endsWith('.md') && file !== 'SUMMARY.md' && file !== 'README.md') {
        this.indexFile(filePath);
      }
    }
  }

  private indexFile(filePath: string) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 1. Extract Title (From first H1 # Header or filename)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      let title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md').replace(/-/g, ' ');
      // Capitalize title
      title = title.replace(/\b\w/g, (c) => c.toUpperCase());

      // 2. Extract Content Snippet (Remove markdown syntax for better searching)
      const plainText = content
        .replace(/#+\s/g, '') // Headers
        .replace(/[[^\]]+]\]\([^)]+\)/g, '$1') // Links
        .replace(/[`*]/g, '') // Formatting
        .substring(0, 500); // Limit context size

      // 3. Construct URL
      // Get relative path from docs root
      const relativePath = path.relative(this.DOCS_PATH, filePath);
      // Remove extension and replace backslashes (Windows) with forward slashes
      const urlPath = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
      const url = `${this.BASE_DOCS_URL}/${urlPath}`;

      this.entries.push({ title, url, content: plainText });
    } catch (err) {
      logger.warn(`Failed to index file ${filePath}: ${err}`);
    }
  }

  search(query: string): DocEntry[] {
    if (!this.fuse) return [];
    return this.fuse.search(query).map(result => result.item);
  }
}

export const docIndexer = new DocIndexer();