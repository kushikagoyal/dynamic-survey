const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
// const { v4: uuidv4 } = require('uuid'); // To generate unique session IDs

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'my_survey',
    password: 'password',
    port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/question/:id', async (req, res) => {
    const questionId = req.params.id;
    try {
        const questionResult = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
        const optionsResult = await pool.query('SELECT * FROM options WHERE question_id = $1', [questionId]);
        
        res.json({
            question: questionResult.rows[0],
            options: optionsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving question');
    }
});

app.post('/submit', async (req, res) => {
    const { questionId, sessionId, option_id, text_answer } = req.body;

    try {
        if (text_answer) {
            await pool.query('INSERT INTO answers (question_id, session_id, text_answer) VALUES ($1, $2, $3)', [questionId, sessionId, text_answer]);
        } else {
            await pool.query('INSERT INTO answers (question_id, session_id, option_id) VALUES ($1, $2, $3)', [questionId, sessionId, option_id]);
        }
        
        let nextQuestionResult;
        if (option_id) {
            nextQuestionResult = await pool.query('SELECT next_question_id FROM options WHERE question_id = $1 AND id = $2', [questionId, option_id]);
        } else {
            nextQuestionResult = await pool.query('SELECT next_question_id FROM options WHERE question_id = $1 LIMIT 1', [questionId]);
        }

        if (nextQuestionResult.rows.length > 0 && nextQuestionResult.rows[0].next_question_id !== null) {
            const nextQuestionId = nextQuestionResult.rows[0].next_question_id;
            res.json({ next: true, nextQuestionId, sessionId });
        } else {
            const scoreResult = await pool.query('SELECT SUM(options.score) FROM answers INNER JOIN options ON answers.option_id = options.id WHERE answers.session_id = $1', [sessionId]);
            const score = scoreResult.rows[0].sum || 0;
            res.json({ next: false, score });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving answer');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
