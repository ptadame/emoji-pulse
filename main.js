import Apify from 'apify';
import fetch from 'node-fetch';

Apify.main(async () => {
    console.log('▶ Emoji-Pulse actor started');

    // ---- placeholder logic ---------------------------------
    const resp = await fetch('https://emojihub.yurace.pro/api/random');
    const json = await resp.json();
    // Save to default dataset so you can see output
    await Apify.pushData(json);
    // --------------------------------------------------------

    console.log('✅ Done, pushed 1 record to the dataset');
});
