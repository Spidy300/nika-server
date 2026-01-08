const express = require('express');
const cors = require('cors');
const { MOVIES, ANIME } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. SMART PROVIDER FINDER ---
let dramaProvider;
let providerName = "None";

try {
    // Try finding Dramacool in different spots
    if (MOVIES.Dramacool) {
        dramaProvider = new MOVIES.Dramacool();
        providerName = "Dramacool (MOVIES)";
    } else if (MOVIES.ViewAsian) {
        dramaProvider = new MOVIES.ViewAsian();
        providerName = "ViewAsian";
    } else if (ANIME.Dramacool) { // Sometimes it hides in ANIME
        dramaProvider = new ANIME.Dramacool();
        providerName = "Dramacool (ANIME)";
    } else {
        // Fallback to FlixHQ if absolutely nothing else exists
        console.log("⚠️ No Drama provider found. Falling back to FlixHQ.");
        dramaProvider = new MOVIES.FlixHQ();
        providerName = "FlixHQ (Backup)";
    }
} catch (e) {
    console.error("Provider Error:", e);
}

// --- 2. HOME ROUTE (Debug Info) ---
app.get('/', (req, res) => {
    res.json({ 
        status: "Online 🟢", 
        current_provider: providerName,
        // This helps us see what IS installed if it fails
        available_movies: Object.keys(MOVIES || {}), 
        url: "https://nika-server-1.onrender.com"
    });
});

// --- 3. DRAMA ROUTES ---
app.get('/drama/search/:query', async (req, res) => {
    try {
        if (!dramaProvider) throw new Error("No Provider Loaded");
        const results = await dramaProvider.search(req.params.query);
        res.json(results);
    } catch (err) { 
        console.error("Search Error:", err.message);
        res.status(500).json({ error: "Search failed", details: err.message }); 
    }
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
    console.log(`Server running on port ${port}. Using: ${providerName}`);
});