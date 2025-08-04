import { Actor } from 'apify';

await Actor.init();

// ─────────────────────────────
// INPUT PARAMETERS (from Apify “Input” tab or API call)
const {
    country   = 'US',   // e.g. "US", "GB", "JP"
    daysBack  = 7       // e.g. 7, 30
} = await Actor.getInput() ?? {};
// ─────────────────────────────

// TODO: replace the block below with your real emoji-trend fetch
console.log(`⏩  Fetching trending emojis for ${country}, last ${daysBack} days…`);
const dummy = [
    { emoji: '😂', score: 98 },
    { emoji: '🔥', score: 95 },
    { emoji: '😭', score: 93 },
];
// END TODO

// store the result so users / API callers can download it
await Actor.setValue('RESULT', dummy);

await Actor.exit();
