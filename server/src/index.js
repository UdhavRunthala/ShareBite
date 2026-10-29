import express from 'express';
const app = express();
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ShareBite' }));
app.listen(4000, () => console.log('ShareBite API: http://localhost:4000'));
