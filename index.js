const express = require('express');
const cors = require('cors');
const { scrapeVideo } = require('./scraper');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Health Check
app.get('/', (req, res) => {
    res.json({ status: "Online", mode: "Puppeteer Scraper 👻" });
});

// 🚀 THE NEW SCRAPER ROUTE
app.get('/scrape', async (req, res) => {
    const url = req.query.url; // We pass the exact link of the movie page
    
    if (!url) {
        return res.status(400).json({ error: "Please provide a ?url= parameter" });
    }

    try {
        const videoUrl = await scrapeVideo(url);
        
        if (videoUrl) {
            res.json({ 
                success: true, 
                stream_url: videoUrl,
                referer: url // Sometimes needed for headers
            });
        } else {
            res.status(500).json({ error: "Could not find video. Site might have blocked us or loaded slowly." });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});