let currentQuestionIndex = 0;
let questions = [];
let answers = []; // Armazena todas as respostas

// Manipulação do formulário de senha
document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('password').value;

    const response = await fetch('/get-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });

    const data = await response.json();
    if (response.ok) {
        if (data.questions && data.questions.length > 0) {
            questions = data.questions;
            currentQuestionIndex = 0; // Reinicia o índice da pergunta
            answers = []; // Reinicia as respostas
            showQuestion();
            // Exibe o formulário de perguntas e oculta o formulário de senha e seu contêiner
            document.getElementById('questions-container').style.display = 'block';
            document.getElementById('password-form').style.display = 'none';
            document.querySelector('.login-container').style.display = 'none'; // Oculta o contêiner do formulário de senha
        } else {
            alert('Nenhuma pergunta disponível.');
        }
    } else {
        alert(data.error || 'Erro ao buscar perguntas.');
    }
});

// Função para mostrar a pergunta atual
function showQuestion() {
    const question = questions[currentQuestionIndex];
    const form = document.getElementById('answers-form');
    form.innerHTML = ''; // Limpa o formulário anterior

    const questionElement = document.createElement('div');
    questionElement.className = 'question'; // Aplica a classe de pergunta
    questionElement.innerHTML = `
        <label>${question.question}</label><br>
        ${question.options.map((option, index) => `
            <div class="answer">
                <input type="radio" name="answer" value="${option}" id="option${index}" required>
                <label for="option${index}" class="answer-label">${option}</label>
            </div>
        `).join('')}
    `;
    form.appendChild(questionElement);

    // Adiciona o botão "Próximo" ou "Enviar Respostas"
    const button = document.createElement('button');
    button.textContent = currentQuestionIndex === questions.length - 1 ? 'Enviar Respostas' : 'Próximo';
    button.type = 'submit';
    form.appendChild(button);
}

// Manipulação do formulário de respostas
document.getElementById('answers-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const selectedOption = document.querySelector('input[name="answer"]:checked');

    if (!selectedOption) {
        alert('Por favor, selecione uma opção.');
        return;
    }

    // Armazena a resposta atual
    answers.push({ questionIndex: currentQuestionIndex, answer: selectedOption.value });

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(); // Mostra a próxima pergunta
    } else {
        // Envia todas as respostas ao backend
        const password = document.getElementById('password').value;
        const response = await fetch('/submit-answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, answers })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message); // Exibe a mensagem de sucesso
            window.location.reload(); // Opcional: recarrega a página
        } else {
            alert('Você errou as seguintes perguntas:\n' + data.errors.map(e => `${e.question}\nSua resposta: ${e.providedAnswer}\nResposta correta: ${e.correctAnswer}`).join('\n\n'));
        }
    }
});
