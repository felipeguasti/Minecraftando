const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Carregar perguntas e respostas
const questionsPath = path.join(__dirname, 'questions.json');
let questions;
try {
    questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
} catch (error) {
    console.error('Erro ao ler o arquivo de perguntas:', error);
}

// Rota para a página inicial
app.get('/', (req, res) => {
    res.render('index');
});

// Rota para obter perguntas com base na senha
app.post('/get-questions', (req, res) => {
    const { password } = req.body;
    if (questions && questions[password]) {
        res.json({ questions: questions[password].questions });
    } else {
        res.status(400).json({ error: 'Senha inválida' });
    }
});

// Rota para enviar respostas e verificar se estão corretas
app.post('/submit-answers', (req, res) => {
    const { password, answers } = req.body;
    const data = questions && questions[password];
    if (!data) {
        return res.status(400).json({ error: 'Senha inválida' });
    }

    let correctCount = 0;
    const errors = [];

    answers.forEach(({ questionIndex, answer }) => {
        const question = data.questions[questionIndex];
        if (question.answer === answer) {
            correctCount++;
        } else {
            errors.push({
                questionIndex, // Índice da pergunta
                questionText: question.question, // Texto da pergunta
                providedAnswer: answer,
                correctAnswer: question.answer
            });
        }
    });

    // Verifica se há erros e responde com uma mensagem apropriada
    if (errors.length > 0) {
        res.json({ 
            success: false, 
            message: `Você errou as perguntas: ${errors.map(e => e.questionIndex + 1).join(', ')}. Tente novamente!`, 
            errors 
        });
    } else {
        res.json({ success: true, message: data.successMessage });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
