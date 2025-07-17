const categoryMap = {
  "General Knowledge": 9,
  "Books": 10,
  "Film": 11,
  "Music": 12,
  "Science & Nature": 17,
  "Computers": 18,
  "Math": 19,
  "History": 23,
  "Sports": 21,
  "Geography": 22,
  "Politics": 24,
  "Animals": 27,
  "Vehicles": 28,
  "Anime & Manga": 31,
  "Cartoon & Animations": 32
};

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
const timePerQuestion = 15; // seconds
let timeLeft = timePerQuestion;

const categorySelect = document.getElementById('categorySelect');
const startBtn = document.getElementById('startBtn');
const quizContainer = document.getElementById('quizContainer');
const questionEl = document.getElementById('question');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');

startBtn.addEventListener('click', startQuiz);

function startQuiz() {
  const selectedCategory = categorySelect.value;
  if (!selectedCategory) {
    alert('Please select a category!');
    return;
  }
  resetQuiz();
  fetchQuestions(categoryMap[selectedCategory]);
}

function resetQuiz() {
  questions = [];
  currentQuestionIndex = 0;
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
  feedbackEl.textContent = '';
  timerEl.textContent = '';
  quizContainer.style.display = 'block';
  startBtn.disabled = true;
  categorySelect.disabled = true;
  updateProgressBar(0, 1); // Reset progress bar
}

async function fetchQuestions(categoryId) {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`);
    const data = await res.json();
    questions = data.results.map(q => ({
      question: decodeHTML(q.question),
      correct_answer: decodeHTML(q.correct_answer),
      options: shuffleArray([ ...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer) ])
    }));
    showQuestion();
  } catch (error) {
    alert('Failed to load questions. Please try again.');
    startBtn.disabled = false;
    categorySelect.disabled = false;
  }
}

function showQuestion() {
  clearInterval(timer);
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }
  timeLeft = timePerQuestion;
  timerEl.textContent = `Time: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}s`;
    if (timeLeft === 0) {
      clearInterval(timer);
      feedbackEl.textContent = `Time's up! Correct answer: ${questions[currentQuestionIndex].correct_answer}`;
      disableOptions();
      nextQuestionDelayed();
    }
  }, 1000);

  const q = questions[currentQuestionIndex];
  questionEl.textContent = `Q${currentQuestionIndex + 1}. ${q.question}`;
  optionsContainer.innerHTML = '';

  q.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.classList.add('optionBtn');
    btn.addEventListener('click', () => selectAnswer(btn, option));
    optionsContainer.appendChild(btn);
  });

  feedbackEl.textContent = '';
}

function selectAnswer(button, selectedOption) {
  clearInterval(timer);
  const correct = questions[currentQuestionIndex].correct_answer;

  disableOptions();

  if (selectedOption === correct) {
    score++;
    feedbackEl.textContent = 'Correct! 🎉';
    button.style.backgroundColor = '#4CAF50'; // green
  } else {
    feedbackEl.textContent = `Wrong! Correct answer: ${correct}`;
    button.style.backgroundColor = '#f44336'; // red
    Array.from(optionsContainer.children).forEach(btn => {
      if (btn.textContent === correct) {
        btn.style.backgroundColor = '#4CAF50';
      }
    });
  }
  scoreEl.textContent = `Score: ${score}`;
  nextQuestionDelayed();
}

function disableOptions() {
  Array.from(optionsContainer.children).forEach(btn => {
    btn.disabled = true;
  });
}

function nextQuestionDelayed() {
  currentQuestionIndex++;
  updateProgressBar(currentQuestionIndex, questions.length); // ✅ update after answering
  setTimeout(() => {
    showQuestion();
  }, 2500);
}

function endQuiz() {
  quizContainer.style.display = 'none';
  startBtn.disabled = false;
  categorySelect.disabled = false;

  const modal = document.getElementById('resultModal');
  const finalScoreText = document.getElementById('finalScoreText');
  finalScoreText.textContent = `You scored ${score} out of ${questions.length}!`;

  modal.style.display = 'block';
}


function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i +1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateProgressBar(current, total) {
  const progress = (current / total) * 100;
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.width = progress + "%";

  // Change color based on progress %
  if (progress <= 30) {
    progressBar.style.backgroundColor = "#ff4d4d"; // red
  } else if (progress <= 70) {
    progressBar.style.backgroundColor = "#ffd93b"; // yellow
  } else {
    progressBar.style.backgroundColor = "#4caf50"; // green
  }
}

function closeModal() {
  document.getElementById('resultModal').style.display = 'none';
}
