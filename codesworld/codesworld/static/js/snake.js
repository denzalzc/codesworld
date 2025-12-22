// Игровые константы и переменные
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {
    x: 15,
    y: 15
};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let speed = 150; // Средняя скорость
let startTime;
let elapsedTime = 0;
let foodEaten = 0;

// DOM элементы
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const speedElement = document.getElementById('speed');
const snakeLengthElement = document.getElementById('snake-length');
const foodEatenElement = document.getElementById('food-eaten');
const gameTimeElement = document.getElementById('game-time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const gameMessage = document.getElementById('game-message');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const messageBtn = document.getElementById('message-btn');

// Кнопки скорости
const slowSpeedBtn = document.getElementById('slow-speed');
const mediumSpeedBtn = document.getElementById('medium-speed');
const fastSpeedBtn = document.getElementById('fast-speed');

// Мобильные кнопки управления
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Инициализация игры
function initGame() {
    // Инициализация змейки
    snake = [{
            x: 10,
            y: 10
        },
        {
            x: 9,
            y: 10
        },
        {
            x: 8,
            y: 10
        }
    ];

    // Сброс направления
    dx = 1;
    dy = 0;

    // Сброс счета и статистики
    score = 0;
    foodEaten = 0;
    elapsedTime = 0;

    // Генерация первой еды
    generateFood();

    // Обновление UI
    updateUI();

    // Скрыть сообщение
    hideMessage();
}

// Генерация еды
function generateFood() {
    // Проверяем, чтобы еда не появлялась на змейке
    let foodOnSnake;
    do {
        foodOnSnake = false;
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);

        // Проверяем каждую часть змейки
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
}

// Отрисовка игры
function drawGame() {
    // Очистка canvas
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка сетки
    drawGrid();

    // Отрисовка змейки
    drawSnake();

    // Отрисовка еды
    drawFood();

    // Отрисовка границ
    drawBorders();
}

// Отрисовка сетки
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Вертикальные линии
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Горизонтальные линии
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Отрисовка змейки
function drawSnake() {
    // Отрисовка каждой части змейки
    snake.forEach((segment, index) => {
        // Голова змейки
        if (index === 0) {
            ctx.fillStyle = '#4cc9f0';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);

            // Глаза змейки
            ctx.fillStyle = '#000';
            const eyeSize = gridSize / 5;
            const eyeOffset = gridSize / 3;

            // Позиция глаз в зависимости от направления
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

            if (dx === 1) { // Вправо
                leftEyeX = segment.x * gridSize + gridSize - eyeOffset;
                leftEyeY = segment.y * gridSize + eyeOffset;
                rightEyeX = segment.x * gridSize + gridSize - eyeOffset;
                rightEyeY = segment.y * gridSize + gridSize - eyeOffset;
            } else if (dx === -1) { // Влево
                leftEyeX = segment.x * gridSize + eyeOffset;
                leftEyeY = segment.y * gridSize + eyeOffset;
                rightEyeX = segment.x * gridSize + eyeOffset;
                rightEyeY = segment.y * gridSize + gridSize - eyeOffset;
            } else if (dy === 1) { // Вниз
                leftEyeX = segment.x * gridSize + eyeOffset;
                leftEyeY = segment.y * gridSize + gridSize - eyeOffset;
                rightEyeX = segment.x * gridSize + gridSize - eyeOffset;
                rightEyeY = segment.y * gridSize + gridSize - eyeOffset;
            } else { // Вверх
                leftEyeX = segment.x * gridSize + eyeOffset;
                leftEyeY = segment.y * gridSize + eyeOffset;
                rightEyeX = segment.x * gridSize + gridSize - eyeOffset;
                rightEyeY = segment.y * gridSize + eyeOffset;
            }

            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Язычок змейки
            ctx.fillStyle = '#f72585';
            let tongueX, tongueY;

            if (dx === 1) { // Вправо
                tongueX = segment.x * gridSize + gridSize;
                tongueY = segment.y * gridSize + gridSize / 2;
                ctx.fillRect(tongueX, tongueY - 2, 5, 4);
            } else if (dx === -1) { // Влево
                tongueX = segment.x * gridSize - 5;
                tongueY = segment.y * gridSize + gridSize / 2;
                ctx.fillRect(tongueX, tongueY - 2, 5, 4);
            } else if (dy === 1) { // Вниз
                tongueX = segment.x * gridSize + gridSize / 2;
                tongueY = segment.y * gridSize + gridSize;
                ctx.fillRect(tongueX - 2, tongueY, 4, 5);
            } else { // Вверх
                tongueX = segment.x * gridSize + gridSize / 2;
                tongueY = segment.y * gridSize - 5;
                ctx.fillRect(tongueX - 2, tongueY, 4, 5);
            }
        }
        // Тело змейки
        else {
            // Градиентное окрашивание тела
            const gradient = ctx.createLinearGradient(
                segment.x * gridSize,
                segment.y * gridSize,
                segment.x * gridSize + gridSize,
                segment.y * gridSize + gridSize
            );

            gradient.addColorStop(0, '#4361ee');
            gradient.addColorStop(1, '#3a0ca3');

            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);

            // Обводка сегментов
            ctx.strokeStyle = '#7209b7';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    });
}

// Отрисовка еды
function drawFood() {
    // Градиент для еды
    const gradient = ctx.createRadialGradient(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        0,
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2
    );

    gradient.addColorStop(0, '#f72585');
    gradient.addColorStop(1, '#b5179e');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Блик на еде
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2 - 3,
        food.y * gridSize + gridSize / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Отрисовка границ
function drawBorders() {
    ctx.strokeStyle = '#4cc9f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
}

// Обновление игры
function updateGame() {
    if (!gameRunning || gamePaused) return;

    // Обновление времени
    updateTime();

    // Перемещение змейки
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Проверка на столкновение со стенами
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Проверка на столкновение с собой
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // Добавление новой головы
    snake.unshift(head);

    // Проверка на поедание еды
    if (head.x === food.x && head.y === food.y) {
        // Увеличение счета
        score += 10;
        foodEaten++;

        // Обновление рекорда
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // Генерация новой еды
        generateFood();

        // Обновление UI
        updateUI();

        // Звуковой эффект (опционально)
        playEatSound();
    } else {
        // Удаление хвоста, если еда не съедена
        snake.pop();
    }

    // Перерисовка игры
    drawGame();
}

// Обновление времени
function updateTime() {
    if (startTime) {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        gameTimeElement.textContent = `${elapsedTime} сек`;
    }
}

// Обновление UI
function updateUI() {
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    snakeLengthElement.textContent = snake.length;
    foodEatenElement.textContent = foodEaten;

    // Обновление текста скорости
    if (speed === 200) {
        speedElement.textContent = 'Медленная';
    } else if (speed === 150) {
        speedElement.textContent = 'Средняя';
    } else {
        speedElement.textContent = 'Быстрая';
    }
}

// Начало игры
function startGame() {
    if (!gameRunning) {
        initGame();
        gameRunning = true;
        gamePaused = false;
        startTime = Date.now();

        // Запуск игрового цикла
        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, speed);

        // Обновление кнопок
        startBtn.innerHTML = '<i class="fas fa-play"></i> Игра идет';
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        // Скрыть сообщение
        hideMessage();

        // Перерисовка
        drawGame();
    }
}

// Пауза игры
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        clearInterval(gameLoop);
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
        showMessage('Игра на паузе', 'Нажмите "Продолжить" или пробел, чтобы возобновить игру', 'Продолжить');
    } else {
        gameLoop = setInterval(updateGame, speed);
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        hideMessage();
    }
}

// Рестарт игры
function restartGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    gamePaused = false;

    // Сброс кнопок
    startBtn.innerHTML = '<i class="fas fa-play"></i> Старт';
    startBtn.disabled = false;
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
    pauseBtn.disabled = false;

    // Показать стартовое сообщение
    showMessage('Готовы начать?', 'Нажмите кнопку "Старт" или пробел, чтобы начать игру', 'Начать игру');

    // Инициализация и отрисовка
    initGame();
    drawGame();
}

// Конец игры
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    // Обновление рекорда
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        updateUI();
        showMessage('Новый рекорд!', `Вы набрали ${score} очков! Длина змейки: ${snake.length}`, 'Играть снова');
    } else {
        showMessage('Игра окончена', `Вы набрали ${score} очков! Длина змейки: ${snake.length}`, 'Играть снова');
    }

    // Сброс кнопок
    startBtn.innerHTML = '<i class="fas fa-play"></i> Старт';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Показать сообщение
function showMessage(title, text, buttonText) {
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageBtn.textContent = buttonText;
    gameMessage.style.display = 'flex';
}

// Скрыть сообщение
function hideMessage() {
    gameMessage.style.display = 'none';
}

// Звук поедания (опционально)
function playEatSound() {
    // Создаем простой звуковой эффект
    try {
        const audioContext = new(window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Если Audio API не поддерживается, просто игнорируем
        console.log("Audio API not supported");
    }
}

// Управление с клавиатуры
function handleKeyDown(e) {
    // Стрелки или WASD
    if ([37, 65].includes(e.keyCode) && dx !== 1) { // Влево
        dx = -1;
        dy = 0;
    } else if ([38, 87].includes(e.keyCode) && dy !== 1) { // Вверх
        dx = 0;
        dy = -1;
    } else if ([39, 68].includes(e.keyCode) && dx !== -1) { // Вправо
        dx = 1;
        dy = 0;
    } else if ([40, 83].includes(e.keyCode) && dy !== -1) { // Вниз
        dx = 0;
        dy = 1;
    } else if (e.keyCode === 32) { // Пробел - пауза/старт
        if (!gameRunning) {
            startGame();
        } else {
            togglePause();
        }
        e.preventDefault();
    } else if (e.keyCode === 82) { // R - рестарт
        restartGame();
    }
}

// Изменение скорости
function setSpeed(newSpeed) {
    speed = newSpeed;

    // Обновление активной кнопки
    slowSpeedBtn.classList.remove('active');
    mediumSpeedBtn.classList.remove('active');
    fastSpeedBtn.classList.remove('active');

    if (speed === 200) {
        slowSpeedBtn.classList.add('active');
    } else if (speed === 150) {
        mediumSpeedBtn.classList.add('active');
    } else {
        fastSpeedBtn.classList.add('active');
    }

    // Обновление UI
    updateUI();

    // Если игра идет, обновить интервал
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, speed);
    }
}

// Инициализация при загрузке страницы
window.onload = function () {
    // Установка начальных значений
    highScoreElement.textContent = highScore;

    // Инициализация и первая отрисовка
    initGame();
    drawGame();

    // Показать стартовое сообщение
    showMessage('Готовы начать?', 'Нажмите кнопку "Старт" или пробел, чтобы начать игру', 'Начать игру');

    // Назначение обработчиков событий

    // Кнопки управления игрой
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    messageBtn.addEventListener('click', function () {
        if (!gameRunning) {
            startGame();
        } else if (gamePaused) {
            togglePause();
        }
    });

    // Кнопки скорости
    slowSpeedBtn.addEventListener('click', () => setSpeed(200));
    mediumSpeedBtn.addEventListener('click', () => setSpeed(150));
    fastSpeedBtn.addEventListener('click', () => setSpeed(100));

    // Мобильные кнопки управления
    upBtn.addEventListener('click', () => {
        if (dy !== 1) {
            dx = 0;
            dy = -1;
        }
    });

    downBtn.addEventListener('click', () => {
        if (dy !== -1) {
            dx = 0;
            dy = 1;
        }
    });

    leftBtn.addEventListener('click', () => {
        if (dx !== 1) {
            dx = -1;
            dy = 0;
        }
    });

    rightBtn.addEventListener('click', () => {
        if (dx !== -1) {
            dx = 1;
            dy = 0;
        }
    });

    // Добавление touch событий для мобильных кнопок
    [upBtn, downBtn, leftBtn, rightBtn].forEach(btn => {
        btn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            this.click();
        });
    });

    // Управление с клавиатуры
    document.addEventListener('keydown', handleKeyDown);

    // Предотвращение прокрутки страницы при управлении стрелками
    window.addEventListener('keydown', function (e) {
        if ([32, 37, 38, 39, 40, 65, 68, 83, 87].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    // Адаптация размера canvas для мобильных устройств
    function resizeCanvas() {
        if (window.innerWidth <= 768) {
            const size = Math.min(window.innerWidth * 0.95, 500);
            canvas.width = size;
            canvas.height = size;
            drawGame();
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
};