import express from 'express';
import routes from '../backend/routes.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error('ERROR OCCURRED IN ROUTE:', err);
  res.status(500).json({ error: err.message });
});

const server = app.listen(5002, async () => {
  try {
    const res = await fetch('http://localhost:5002/api/dashboard/summary');
    console.log('STATUS:', res.status);
    console.log('BODY:', await res.json());
  } catch (err) {
    console.error('FETCH ERROR:', err);
  } finally {
    server.close();
  }
});
