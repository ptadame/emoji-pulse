const Apify = require('apify');

Apify.main(async () => {
    const input     = await Apify.getInput() || {};
    const country   = input.country  || 'US';
    const daysBack  = input.daysBack || 7;

    console.log(`⏩  Fetching trending emojis for ${country}, last ${daysBack} days…`);

    // placeholder result
    const dummy = [
        { emoji: '😂', score: 98 },
        { emoji: '🔥', score: 95 },
        { emoji: '😭', score: 93 }
    ];

    await Apify.setValue('RESULT', dummy);
});
