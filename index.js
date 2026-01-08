const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. INITIALIZE ALL PROVIDERS ---
const providers = {
    flixhq: new MOVIES.FlixHQ(),
    dramacool: new MOVIES.DramaCool(), // Note: Capital 'C' based on your server
    goku: new MOVIES.Goku(),
    sflix: new MOVIES.SFlix(),
    viewasian: new MOVIES.ViewAsian(),
};

// --- 2. HOME ROUTE ---
app.get('/', (req, res) => {
    res.json({
        message: "Nika Universal API is Online 🟢",
        available_providers: Object.keys(providers),
        url: "https://nika-server-1.onrender.com"
    });
});

// --- 3. UNIVERSAL ROUTES ---
// We add a ':source' parameter so the Frontend can choose the provider!

// Search: /flixhq/search/squid game
app.get('/:source/search/:query', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        if (!providers[source]) throw new Error("Invalid Provider");
        const results = await providers[source].search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Info: /flixhq/info/tv/watch-squid-game-39393
app.get('/:source/info/:id', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        // You generally need decodeURIComponent for IDs with slashes
        const id = decodeURIComponent(req.params.id); 
        const info = await providers[source].fetchMediaInfo(id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Watch: /flixhq/watch/tv/watch-squid-game-39393.1234
app.get('/:source/watch/:episodeId', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        const id = decodeURIComponent(req.params.episodeId);
        const sources = await providers[source].fetchEpisodeSources(id);
        res.json(sources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});