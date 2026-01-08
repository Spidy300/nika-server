const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Use FlixHQ (Best stability, no 403 Errors)
const provider = new MOVIES.FlixHQ(); 

app.get('/', (req, res) => {
    res.json({ 
        message: "Nika API is Online (Powered by FlixHQ) 🟢", 
        url: "https://nika-server-1.onrender.com" 
    });
});

// --- ROUTES ---

app.get('/drama/search/:query', async (req, res) => {
    try {
        const results = await provider.search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/drama/info/:id', async (req, res) => {
    try {
        const info = await provider.fetchMediaInfo(req.params.id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/drama/watch/:episodeId', async (req, res) => {
    try {
        const sources = await provider.fetchEpisodeSources(req.params.episodeId);
        res.json(sources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});