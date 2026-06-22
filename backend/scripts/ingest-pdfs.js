import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ingestFile } from '../src/services/ingest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDFS_DIR = path.resolve(__dirname, '../../pdfs');

async function main() {
  if (!fs.existsSync(PDFS_DIR)) {
    console.error(`PDF directory not found: ${PDFS_DIR}`);
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(PDFS_DIR).filter((f) => f.endsWith('.pdf'));
  if (pdfFiles.length === 0) {
    console.log('No PDF files found in /pdfs directory.');
    return;
  }

  for (const file of pdfFiles) {
    console.log(`\nProcessing: ${file}`);
    const result = await ingestFile(path.join(PDFS_DIR, file), (msg) =>
      process.stdout.write(`  ${msg}\r`),
    );
    console.log(`  Done: ${result.filename} (${result.chunks} chunks)`);
  }

  console.log('\nIngestion complete!');
}

main().catch(console.error);
