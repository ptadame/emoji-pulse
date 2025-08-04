import { Actor } from 'apify';

await Actor.init();

const { country = 'US', daysBack = 7 } = await Actor.getInput() ?? {};

console.log(`Fetching emojis for ${country}, last ${daysBack} days…`);
/* your scraping code goes here */

await Actor.setValue('OUTPUT', { ok: true });
await Actor.exit();
