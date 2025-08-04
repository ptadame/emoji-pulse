/**
 * main.js — Emoji-Pulse Actor  v0.3  (SDK 3  + native fetch)
 * ----------------------------------------------------------
 * 1. Reads `country` and `daysBack` from Actor input.
 * 2. Downloads trending-video metadata from TikTok Creative Center (*).
 * 3. Counts every Unicode emoji that appears in captions.
 * 4. Writes Top-10 list to RESULT.json and pushes one summary row.
 *
 * (*) If TikTok changes the endpoint, point TREND_URL at a dataset
 *     produced by another Actor or your own scraper.
 */

const { Actor }   = require('apify');      // SDK v3 entry
const emojiRegex  = require('emoji-regex'); // universal regex

Actor.main(async () => {
    /* 1 ───────────────────────────── INPUT */
    const input     = await Actor.getInput() ?? {};
    const country   = (input.country   || 'US').toUpperCase(); // "US","GB",…
    const daysBack  = Number(input.daysBack) || 7;             // 1-30

    console.log(`⏩  Fetching trending videos for ${country}, last ${daysBack} days…`);

    /* 2 ───────────────────── FETCH DATA */
    const TREND_URL =
        `https://business-api.tiktok.com/open_api/v1/creative_center/video/trending/` +
        `?country_code=${country}&days=${daysBack}&page_size=200`;

    let videos = [];
    try {
        const res = await fetch(TREND_URL, { headers: { accept: 'application/json' } });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`HTTP ${res.status} – ${body.slice(0,120)}`);
        }

        const json = await res.json();
        videos     = json?.data?.videos ?? [];
        console.log(`ℹ️  Received ${videos.length} video records`);
    } catch (err) {
        console.error('❌  Download problem:', err.message);
        await Actor.setValue('RESULT', []);      // graceful fallback
        return;                                  // end run successfully
    }

    /* 3 ─────────────────── EMOJI COUNTING */
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

    /* 4 ───────────────────────── OUTPUT */
    await Actor.setValue('RESULT', top10);                 // key-value store
    await Actor.pushData({ country, daysBack, top10 });    // one dataset row

    console.log('✅  Top-10 emojis saved:', top10);
});
