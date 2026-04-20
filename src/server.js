import express from 'express';
import matchesRouter from "./routes/matches.js"
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/matches", matchesRouter)

app.get('/', (req, res) => {
  res.send('Hello, welcome to Sportz!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
