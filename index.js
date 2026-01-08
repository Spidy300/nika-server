const express = require('express');
const cors = require('cors');
const { ANIME, MOVIES } = require('@consumet/extensions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const gogoanime = new ANIME.Gogoanime();
const dramacool = new MOVIES.Dramacool();

app.get('/', (req, res) => res.json({ message: "Nika API Online", routes: ["/anime/search", "/drama/search"] }));

// ANIME
app.get('/anime/search/:query', async (req, res) => res.json(await gogoanime.search(req.params.query)));
app.get('/anime/info/:id', async (req, res) => res.json(await gogoanime.fetchAnimeInfo(req.params.id)));
app.get('/anime/watch/:episodeId', async (req, res) => res.json(await gogoanime.fetchEpisodeSources(req.params.episodeId)));

// DRAMA (The Missing Part)
app.get('/drama/search/:query', async (req, res) => {
    try { res.json(await dramacool.search(req.params.query)); } 
    catch (err) { res.status(500).json({ error: "Search failed" }); }
});
app.get('/drama/info/:id', async (req, res) => {
    try { res.json(await dramacool.fetchMediaInfo(req.params.id)); } 
    catch (err) { res.status(500).json({ error: "Info failed" }); }
});
app.get('/drama/watch/:episodeId', async (req, res) => {
    try { res.json(await dramacool.fetchEpisodeSources(req.params.episodeId)); } 
    catch (err) { res.status(500).json({ error: "Watch failed" }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));