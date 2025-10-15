const { pool } = require('../server');

const getAllQuizzes = (callback) => {
    pool.query('SELECT * FROM quizzes', (err, results) => {
        callback(err, results);
    });
};

module.exports = { getAllQuizzes };
