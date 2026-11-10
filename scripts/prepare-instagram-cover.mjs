import { readFile, writeFile } from 'node:fs/promises';
import { renderInstagramCover } from './lib/social-cover.mjs';
const [photoPath, location, price, outputPath] = process.argv.slice(2);
if (!photoPath || !outputPath) throw new Error('Usage: node scripts/prepare-instagram-cover.mjs PHOTO LOCATION PRICE OUTPUT_HTML');
const data = await readFile(photoPath);
const mime = data[0] === 255 && data[1] === 216 ? 'jpeg' : data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : data.toString('ascii',0,4) === 'RIFF' && data.toString('ascii',8,12) === 'WEBP' ? 'webp' : null;
if (!mime) throw new Error('Unsupported image format.');
await writeFile(outputPath, renderInstagramCover({ location, price: Number(price), photoData: `data:image/${mime};base64,${data.toString('base64')}` }));
