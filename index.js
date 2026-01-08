const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Initialize ViewAsian (The working provider for K-Drama/Asian Drama)
const viewAsian = new MOVIES.ViewAsian(); 

app.get('/', (req, res) => {
    res.json({ 
        message: "Nika Drama API is Online 🟢", 
        url: "https://nika-server-z6f8.onrender.com" 
    });
});

// --- DRAMA ROUTES (Using ViewAsian) ---

app.get('/drama/search/:query', async (req, res) => {
    try {
        // ViewAsian search
        const results = await viewAsian.search(req.params.query);
        res.json(results);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/drama/info/:id', async (req, res) => {
    try {
        const info = await viewAsian.fetchMediaInfo(req.params.id);
        res.json(info);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/drama/watch/:episodeId', async (req, res) => {
    try {
        const sources = await viewAsian.fetchEpisodeSources(req.params.episodeId);
        res.json(sources);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});