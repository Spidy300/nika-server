const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function scrapeVideo(targetUrl) {
    let browser = null;
    try {
        console.log("🚀 Launching Ghost Browser...");
        
        // Launch options optimized for Render/Cloud
        browser = await puppeteer.launch({
            args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true, // Run in background (invisible)
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Masking: Look like a real Windows PC user
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36");

        let m3u8Link = null;

        // 🕵️ LISTENER: Sniff network traffic for video files
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const url = req.url();
            
            // Allow scraping of the target site, block heavy ads/images to speed it up
            if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
                req.abort();
            } else {
                // Check if this request is the video master file
                if (url.includes('.m3u8') && !url.includes('google') && !url.includes('stat')) {
                    console.log("✅ FOUND VIDEO SOURCE:", url);
                    m3u8Link = url;
                }
                req.continue();
            }
        });

        console.log(`🌐 Navigating to: ${targetUrl}`);
        // Go to the page and wait for network to settle
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait a few seconds for the player to initialize and send the request
        // (You can increase this if sites are slow)
        await new Promise(r => setTimeout(r, 6000));

        await browser.close();
        return m3u8Link;

    } catch (error) {
        console.error("❌ Scrape Error:", error.message);
        if (browser) await browser.close();
        return null;
    }
}

module.exports = { scrapeVideo };