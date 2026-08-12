import express from 'express';
import cors from 'cors';
import { linkedListInsertSteps } from './data/linkedListInsert';

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/visualize/linked-list/insert', (req, res) => {
  res.json(linkedListInsertSteps);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
