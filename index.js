const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions'); // We only import MOVIES now

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Initialize ONLY Dramacool (Since Gogoanime was crashing)
const dramacool = new MOVIES.Dramacool();

app.get('/', (req, res) => {
    res.json({ 
        message: "Nika Drama API is Online 🟢", 
        url: "https://nika-server-z6f8.onrender.com" 
    });
});

// --- DRAMA ROUTES (Dramacool) ---

app.get('/drama/search/:query', async (req, res) => {
    try {
        const results = await dramacool.search(req.params.query);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/drama/info/:id', async (req, res) => {
    try {
        const info = await dramacool.fetchMediaInfo(req.params.id);
        res.json(info);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/drama/watch/:episodeId', async (req, res) => {
    try {
        const sources = await dramacool.fetchEpisodeSources(req.params.episodeId);
        res.json(sources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});