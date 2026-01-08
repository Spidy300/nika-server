const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. PROVIDER SETUP ---
const providers = {};

// Load FlixHQ (Primary)
try {
    providers['flixhq'] = new MOVIES.FlixHQ();
    console.log("✅ Loaded: FlixHQ");
} catch (e) {
    console.log("❌ Error loading FlixHQ:", e.message);
}

// Load Backups (Just in case)
try { providers['sflix'] = new MOVIES.SFlix(); } catch (e) {}
try { providers['goku'] = new MOVIES.Goku(); } catch (e) {}


// --- 2. ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.json({
        message: "Nika Backend is Online 🟢",
        active_providers: Object.keys(providers),
        server_time: new Date().toISOString()
    });
});

// Search Route
app.get('/:source/search/:query', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        if (!providers[source]) throw new Error("Provider not active");
        const results = await providers[source].search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Info Route
app.get('/:source/info/:id', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        const id = decodeURIComponent(req.params.id); 
        const info = await providers[source].fetchMediaInfo(id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Watch Route (Extract Video)
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