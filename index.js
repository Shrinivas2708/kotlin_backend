const env = require("dotenv")
env.config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const blogsRouter = require('./routes/blogs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/blogs', blogsRouter);

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/daily_journal';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO)
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log('Server listening on', PORT));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
