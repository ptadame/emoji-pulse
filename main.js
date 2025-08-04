/**
 * main.js  –  Emoji-Pulse v0.1
 * ---------------------------------------------
 * 1. Reads `country` and `daysBack` from the Actor input.
 * 2. Downloads trending-video metadata from TikTok Creative Center.
 * 3. Counts every Unicode emoji that appears in video captions.
 * 4. Saves a Top-10 array into RESULT.json and also stores
 *    a one-line summary in the default dataset.
 *
 * NOTE — TikTok’s Creative-Center endpoints change often.
 * If the fetch below stops working, replace `TREND_URL`
 * with either:
 *   • your own Apify “TikTok trending-videos” dataset URL, or
 *   • any other JSON feed that contains video captions.
 */

const Apify      = require('apify');       // Apify SDK (CommonJS flavour)
const fetch      = require('node-fetch');  // HTTP client
const emojiRegex = require('emoji-regex'); // Regex util

Apify.main(async () => {
    /* 1 ─────────────────────────────────────────────── INPUT */
    const input            = await Apify.getInput() || {};
    const country          = input.country  || 'US';   // "US", "GB", ...
    const daysBack         = input.daysBack || 7;      // 1-30

    console.log(`⏩  Fetching trending emojis for ${country}, last ${daysBack} days…`);

    /* 2 ─────────────────────────────────────── DOWNLOAD DATA */
    const TREND_URL =
      `https://business-api.tiktok.com/open_api/v1/creative_center/video/trending/` +
      `?country_code=${country}&days=${daysBack}&page_size=200`;

    let videos = [];
    try {
        const resp  = await fetch(TREND_URL);
        const json  = await resp.json();
        videos      = json?.data?.videos || [];
        console.log(`ℹ️  Received ${videos.length} video records`);
    } catch (err) {
        console.error('❌  Unable to fetch TikTok data:', err.message);
        throw err;
    }

    /* 3 ────────────────────────────────────── EMOJI ANALYTICS */
    const counts = Object.create(null);
    const rx     = emojiRegex();

    for (const v of videos) {
        const caption = v.title || v.desc || '';
        for (const m of caption.matchAll(rx)) {
            const e = m[0];
            counts[e] = (counts[e] || 0) + 1;
        }
    }

    const top10 = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([emoji, count], idx) => ({ rank: idx + 1, emoji, count }));

    /* 4 ─────────────────────────────────────────────── OUTPUT */
    await Apify.setValue('RESULT', top10);        // key-value store
    await Apify.pushData({ country, daysBack, top10 });  // dataset row

    console.log('✅  Top-10 emojis saved:', top10);
});
