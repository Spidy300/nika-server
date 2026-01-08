const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// --- 1. LOAD PROVIDERS ---
const providers = {};

// We load multiple providers for backup
try { providers['flixhq'] = new MOVIES.FlixHQ(); console.log("✅ FlixHQ Loaded"); } catch (e) {}
try { providers['sflix'] = new MOVIES.SFlix(); console.log("✅ SFlix Loaded"); } catch (e) {}
try { providers['goku'] = new MOVIES.Goku(); console.log("✅ Goku Loaded"); } catch (e) {}
try { 
    // Alias 'drama' to FlixHQ for compatibility
    providers['drama'] = providers['flixhq']; 
} catch (e) {}

app.get('/', (req, res) => {
    res.json({
        message: "Nika Backend Online 🟢",
        providers: Object.keys(providers)
    });
});

// --- 2. UNIVERSAL ROUTES ---
app.get('/:source/search/:query', async (req, res) => {
    try {
        const source = req.params.source.toLowerCase();
        if (!providers[source]) return res.status(404).json({error: "Provider not found"});
        
        const results = await providers[source].search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/:source/info/:id', async (req, res) => {
    try {
        const source = req.params.source.toLowerCase();
        const id = decodeURIComponent(req.params.id); 
        const info = await providers[source].fetchMediaInfo(id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/:source/watch/:episodeId', async (req, res) => {
    try {
        const source = req.params.source.toLowerCase();
        const id = decodeURIComponent(req.params.episodeId);
        const sources = await providers[source].fetchEpisodeSources(id);
        res.json(sources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));