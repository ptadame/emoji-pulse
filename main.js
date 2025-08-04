/**
 * main.js — Emoji-Pulse v0.1 (SDK v3 style)
 * ---------------------------------------------
 * 1. Reads `country` + `daysBack` from actor input
 * 2. Downloads trending-video data from TikTok Creative Center
 * 3. Counts every Unicode emoji in the captions
 * 4. Saves a Top-10 list to RESULT.json and pushes one row to the dataset
 */

const { Actor }  = require('apify');      // <-- note the destructuring!
const emojiRegex = require('emoji-regex'); // regex helper

Actor.main(async () => {
    /* 1 — INPUT */
    const input     = await Actor.getInput() ?? {};
    const country   = input.country  || 'US';
    const daysBack  = input.daysBack || 7;

    console.log(`⏩  Fetching trending emojis for ${country}, last ${daysBack} days…`);

    /* 2 — DOWNLOAD DATA (replace TREND_URL later with your own source) */
    const TREND_URL =
      `https://business-api.tiktok.com/open_api/v1/creative_center/video/trending/` +
      `?country_code=${country}&days=${daysBack}&page_size=200`;

    let videos = [];
    try {
        const res  = await fetch(TREND_URL);
        const json = await res.json();
        videos     = json?.data?.videos ?? [];
        console.log(`ℹ️  Received ${videos.length} video records`);
    } catch (err) {
        console.error('❌  Fetch failed:', err.message);
        throw err;
    }

    /* 3 — EMOJI COUNTING */
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
        .map(([emoji, count], i) => ({ rank: i + 1, emoji, count }));

    /* 4 — OUTPUT */
    await Actor.setValue('RESULT', top10);             // key-value store
    await Actor.pushData({ country, daysBack, top10 }); // dataset row

    console.log('✅  Top-10 emojis saved:', top10);
});
