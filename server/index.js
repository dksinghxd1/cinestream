import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

app.get('/api/popular', async (req, res) => {
  try {
    const tmdbRes = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    res.json(tmdbRes.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const tmdbRes = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    res.json(tmdbRes.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
