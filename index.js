const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. PROVIDER SETUP ---
const providers = {};

try {
    // FORCE-FIX: We manually set the domain to one that works
    const dramacool = new MOVIES.DramaCool();
    // This overrides the old broken link in the library
    dramacool.baseUrl = "https://asianc.sh"; 
    providers['dramacool'] = dramacool;
    console.log("✅ Loaded: DramaCool (Patched)");
} catch (e) { console.log("❌ DramaCool Error:", e.message); }

try {
    providers['flixhq'] = new MOVIES.FlixHQ();
    providers['goku'] = new MOVIES.Goku();
    providers['sflix'] = new MOVIES.SFlix();
} catch (e) {}


app.get('/', (req, res) => {
    res.json({
        message: "Nika API Online (DramaCool Patched) 🟢",
        active: Object.keys(providers),
        url: "https://nika-server-1.onrender.com"
    });
});

// --- 2. ROUTES ---

app.get('/:source/search/:query', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        if (!providers[source]) throw new Error("Invalid Provider");
        const results = await providers[source].search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/:source/info/:id', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        const id = decodeURIComponent(req.params.id); 
        const info = await providers[source].fetchMediaInfo(id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

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