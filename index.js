import express from "express";
import bodyParser from "body-parser";
import pkg from "pg";
import ejs from "ejs";
import { fileURLToPath } from "url";
import path from "path";
import { dirname, join } from "path";
import cors from "cors";
import env from "dotenv";
import { sql } from "@vercel/postgres";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
env.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database', err));

app.use(cors());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(express.static(__dirname + "/public/"));

let quiz = [];
pool.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  // pool.end();
});

let totalCorrect = 0;

let currentQuestion = {};

// GET home page
// app.get("/", async (req, res) => {
//   totalCorrect = 0;
//   await nextQuestion();
//   console.log(currentQuestion);
//   res.render("index.ejs", { question: currentQuestion });
// });

// GET home page
// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  currentQuestion = await nextQuestion();
  console.log(currentQuestion);
  if (currentQuestion) {
    res.render("index.ejs", { question: currentQuestion });
  } else {
    // If currentQuestion is undefined, render an error message or handle it as needed
    res.status(500).send("Error: Unable to retrieve the question");
  }
});


// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// async function nextQuestion() {
//   const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
//   currentQuestion = randomCountry;
// }

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
  return currentQuestion;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
