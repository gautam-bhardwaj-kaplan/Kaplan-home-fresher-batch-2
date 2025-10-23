const pool = require("../config/db");
const OpenAI = require("openai");
const asyncHandler = require("../middleware/asyncHandler");

const openai = new OpenAI();

const toCamelCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(v => toCamelCase(v));
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/([-_][a-z])/g, g => g.toUpperCase().replace(/[-_]/, ''));
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

const getAllQuizzes = asyncHandler(async (req, res) => {
  const userId = req.query.userId || 4; 
  const query = `
    SELECT
      q.id, q.title, q.description, q.duration,
      (SELECT s.pass_status
       FROM submissions s
       WHERE s.quiz_id = q.id AND s.user_id = ?
       ORDER BY s.id DESC
       LIMIT 1) AS passStatus
    FROM quizzes q;
    -- Optionally filter by is_active if you only want to show active quizzes
    -- WHERE q.is_active = 1;
  `;
  const [quizzes] = await pool.query(query, [userId]);
  res.json(toCamelCase(quizzes));
});

const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [quizResult] = await pool.query("SELECT id, title, description, duration FROM quizzes WHERE id = ?", [id]);
  if (quizResult.length === 0) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  const [questionResult] = await pool.query("SELECT id, question_text, type, options, correct_answer FROM questions WHERE quiz_id = ?", [id]);
  const questions = questionResult.map(q => ({ ...q, options: q.options || [] }));
  res.json({
    quiz: toCamelCase(quizResult[0]),
    questions: toCamelCase(questions),
  });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { userId, quizId, answers } = req.body;
  const [questions] = await pool.query("SELECT * FROM questions WHERE quiz_id = ?", [quizId]);

  let score = 0;
  questions.forEach(q => {
    if (q.type === "MCQ" && answers[q.id] === q.correct_answer) {
      score++;
    }
  });

  const percentage = (score / questions.length) * 100;
  const passStatus = percentage >= 75 ? 'pass' : 'fail';

  const submission = { user_id: userId, quiz_id: quizId, score, pass_status: passStatus };
  const [result] = await pool.query("INSERT INTO submissions SET ?", submission);
  const submissionId = result.insertId;

  if (passStatus === 'pass') {
    try {
      await pool.query("UPDATE quizzes SET is_active = 0 WHERE id = ?", [quizId]);
      console.log(`Quiz ID ${quizId} marked as inactive due to passing score.`);
    } catch (updateError) {
      console.error(`Error updating is_active status for quiz ID ${quizId}:`, updateError.message);
    }
  }

  const answerEntries = Object.entries(answers).map(([qId, ans]) => {
    const question = questions.find(q => q.id == qId);
    const isCorrect = question && question.correct_answer === ans ? 1 : 0;
    return [submissionId, qId, ans, isCorrect];
  });
  if (answerEntries.length > 0) {
    await pool.query("INSERT INTO answers (submission_id, question_id, user_answer, is_correct) VALUES ?", [answerEntries]);
  }

  res.status(201).json({ submissionId, score, passStatus });
});

const getResults = asyncHandler(async (req, res) => {
   const { submissionId } = req.params;
  const query = `
    SELECT
      s.quiz_id, qu.title AS quiz_title, s.score, s.pass_status, q.id AS question_id,
      q.question_text, q.correct_answer, a.user_answer, a.is_correct
    FROM submissions s
    JOIN quizzes qu ON s.quiz_id = qu.id
    JOIN questions q ON qu.id = q.quiz_id
    LEFT JOIN answers a ON s.id = a.submission_id AND q.id = a.question_id
    WHERE s.id = ?;`;
  const [results] = await pool.query(query, [submissionId]);
  if (results.length === 0) {
    res.status(404);
    throw new Error("Result not found.");
  }

  const questionsWithAI = [];
  for (const row of results) {
    let explanation = "AI explanation is not available for this question.";
    if (row.correct_answer) {
      try {
        const prompt = `Question: "${row.question_text}". The correct answer is "${row.correct_answer}". Please provide a brief, simple explanation for why this is the correct answer.`;
        const aiRes = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 70,
        });
        if (aiRes.choices[0].message.content) {
          explanation = aiRes.choices[0].message.content.trim();
        }
      } catch (e) {
        console.error(`OpenAI Error:`, e.message);
      }
    }
    questionsWithAI.push({ ...row, userAnswer: row.user_answer || null, explanation });
  }

  const finalResult = {
    quizId: results[0].quiz_id,
    quizTitle: results[0].quiz_title,
    score: results[0].score,
    totalQuestions: results.length,
    passStatus: results[0].pass_status,
    questions: toCamelCase(questionsWithAI),
  };
  res.json(finalResult);
});


module.exports = { getAllQuizzes, getQuizById, submitQuiz, getResults };