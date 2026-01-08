const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. PROVIDER SETUP ---
// We found out your server has "DramaCool" (Capital C)
let dramaProvider;

try {
    // Exact spelling from your "available_movies" list
    dramaProvider = new MOVIES.DramaCool(); 
    console.log("✅ Successfully loaded: DramaCool");
} catch (e) {
    console.log("⚠️ DramaCool failed, trying FlixHQ as backup.");
    dramaProvider = new MOVIES.FlixHQ();
}

app.get('/', (req, res) => {
    res.json({ 
        message: "Nika Drama API is Online 🟢", 
        provider: "DramaCool", 
        url: "https://nika-server-1.onrender.com" 
    });
});

// --- 2. ROUTES ---

app.get('/drama/search/:query', async (req, res) => {
    try {
        const results = await dramaProvider.search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/drama/info/:id', async (req, res) => {
    try {
        const info = await dramaProvider.fetchMediaInfo(req.params.id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/drama/watch/:episodeId', async (req, res) => {
    try {
        const sources = await dramaProvider.fetchEpisodeSources(req.params.episodeId);
        res.json(sources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});