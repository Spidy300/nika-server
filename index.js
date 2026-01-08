const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. SAFE PROVIDER LOADER ---
const providers = {};

function loadProvider(name, providerClass) {
    try {
        if (providerClass) {
            providers[name] = new providerClass();
            console.log(`✅ Loaded: ${name}`);
        } else {
            console.log(`⚠️ Skipped: ${name} (Not found in library)`);
        }
    } catch (e) {
        console.log(`❌ Failed to load: ${name} - ${e.message}`);
    }
}

// Load the known working ones
loadProvider('flixhq', MOVIES.FlixHQ);
loadProvider('dramacool', MOVIES.DramaCool); // Capital 'C' based on your server
loadProvider('goku', MOVIES.Goku);
loadProvider('sflix', MOVIES.SFlix);
loadProvider('himovies', MOVIES.HiMovies); // Adding HiMovies as it is stable
// We removed ViewAsian because it was crashing the server

// --- 2. HOME ROUTE ---
app.get('/', (req, res) => {
    res.json({
        message: "Nika Universal API is Online 🟢",
        active_providers: Object.keys(providers),
        url: "https://nika-server-1.onrender.com"
    });
});

// --- 3. UNIVERSAL ROUTES ---

// Search
app.get('/:source/search/:query', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        if (!providers[source]) throw new Error("Invalid or Inactive Provider");
        const results = await providers[source].search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Info
app.get('/:source/info/:id', async (req, res) => {
    const source = req.params.source.toLowerCase();
    try {
        const id = decodeURIComponent(req.params.id); 
        const info = await providers[source].fetchMediaInfo(id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Watch
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