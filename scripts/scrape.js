// scripts/scrape.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function main(outputPath) {
  const url = 'https://www.tiktok.com/business/creativecenter/inspiration/popular/trending?country=US&days=7';
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // TODO: adapt to the real JSON shape
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
  console.log(`Wrote ${outputPath}`);
}

const [ , , outputPath ] = process.argv;
main(outputPath).catch(e => {
  console.error(e);
  process.exit(1);
});
