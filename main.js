/**
 * main.js  –  Emoji-Pulse Actor v0.2
 * ---------------------------------------------
 * 1) Reads `country` and `daysBack` from the Actor input.
 * 2) Downloads trending-video metadata from TikTok Creative Center (*) .
 * 3) Counts every Unicode emoji that appears in video captions.
 * 4) Saves a Top-10 list into RESULT.json and also pushes one
 *    summary row into the default dataset.
 *
 * (*) TikTok often rate–limits or moves this endpoint.
 *     If it stops working, point TREND_URL at a dataset produced
 *     by another Actor (see README) or your own scraper.
 */

const Apify      = require('apify');       // Apify SDK (CommonJS)
const fetch      = require('node-fetch');  // HTTP client
const emojiRegex = require('emoji-regex'); // Universal emoji regex

Apify.main(async () => {
    /* 1 ─────────────────────────────── INPUT */
    const input     = await Apify.getInput()  || {};
    const country   = (input.country   || 'US').toUpperCase(); // "US","GB",…
    const daysBack  = Number(input.daysBack) || 7;             // 1-30

    console.log(`⏩  Fetching trending videos for ${country}, last ${daysBack} days…`);

    /* 2 ─────────────────────── DOWNLOAD DATA */
    const TREND_URL =
      `https://business-api.tiktok.com/open_api/v1/creative_center/video/trending/` +
      `?country_code=${country}&days=${daysBack}&page_size=200`;

    let videos = [];
    try {
        const res = await fetch(TREND_URL, { headers: { accept: 'application/json' } });

        if (!res.ok) {                       // 4xx/5xx or CloudFront block
            const body = await res.text();
            throw new Error(`HTTP ${res.status} – ${body.slice(0,120)}`);
        }

        const json = await res.json();       // will throw if not valid JSON
        videos     = json?.data?.videos ?? [];
        console.log(`ℹ️  Received ${videos.length} video records`);
    } catch (err) {
        console.error('❌  Download problem:', err.message);
        // Finish gracefully so the Actor run itself does not fail
        await Apify.setValue('RESULT', []);
        return;
    }

    /* 3 ────────────────────── EMOJI ANALYTICS */
    const counts = Object.create(null);
    const rx     = emojiRegex();

    for (const v of videos) {
        const caption = v.title || v.desc || '';
        for (const m of caption.matchAll(rx)) {
            const e = m[0];
            counts[e] = (counts[e] || 0) + 1;
        }
    }

    const top10 = Object
        .entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([emoji, count], i) => ({ rank: i + 1, emoji, count }));

    /* 4 ───────────────────────────── OUTPUT */
    await Apify.setValue('RESULT', top10);                 // key-value store
    await Apify.pushData({ country, daysBack, top10 });    // dataset row

    console.log('✅  Top-10 emojis saved:', top10);
});

