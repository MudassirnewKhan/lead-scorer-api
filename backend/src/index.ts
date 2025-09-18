import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
/*import scoringRouter from './api/routes/scoring.routes';*/

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

/*app.use('/api', scoringRouter);*/

app.get('/', (req, res) => {
  res.status(200).send('Lead Scoring API is running!');
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
