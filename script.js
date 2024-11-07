const PLAYER_X = 'X';
const PLAYER_O = 'O';
const CELL_SIZE = 40; // Zmenšená velikost buňky pro 15×15

const { board, message, resetButton, scoreX, scoreO, darkModeToggle } = {
    board: document.getElementById('board'),
    message: document.getElementById('message'),
    resetButton: document.getElementById('resetButton'),
    scoreX: document.getElementById('scoreX'),
    scoreO: document.getElementById('scoreO'),
    darkModeToggle: document.getElementById('darkModeToggle')
};

let currentPlayer = PLAYER_X;
let gameActive = true;
let boardState = [];
const scores = new Map([[PLAYER_X, 0], [PLAYER_O, 0]]);
let boardSize = 5;  // Změněno na 5
let winCondition = 5;  // Změněno na 5

function setBoardSize(size) {
    boardSize = size;
    // Nastavení podmínky výhry podle velikosti pole
    if (size === 3) {
        winCondition = 3;
    } else if (size === 4) {
        winCondition = 4;
    } else {
        winCondition = 5;
    }
    // Nastavení velikosti buněk - menší pro 15×15
    const cellSize = size === 15 ? 40 : 100;
    document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
    resetGame();
    renderBoard();
    updateWinConditionButtons();
    updateBoardSizeButtons();
}

function updateBoardSizeButtons() {
    const buttons = document.querySelectorAll('.board-size-buttons button');
    buttons.forEach(button => {
        const size = parseInt(button.textContent);
        if (size === boardSize) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function setWinCondition(condition) {
    winCondition = condition;
    resetGame();
    renderBoard();
    updateWinConditionButtons();
}

function updateWinConditionButtons() {
    const buttons = document.querySelectorAll('.win-condition-buttons button');
    buttons.forEach(button => {
        const condition = parseInt(button.textContent);
        if (condition === winCondition) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        // Zakázat tlačítka, která nejsou platná pro aktuální velikost pole
        if ((boardSize === 3 && condition > 3) || (boardSize === 4 && condition > 4)) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    });
}

function renderBoard() {
    board.innerHTML = '';
    const cellSize = boardSize === 15 ? 40 : 100;
    board.style.gridTemplate = `repeat(${boardSize}, ${cellSize}px) / repeat(${boardSize}, ${cellSize}px)`;

    boardState = Array(boardSize * boardSize).fill(null);
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.fontSize = boardSize === 15 ? '1.2em' : '2em';
        board.appendChild(cell);
    }
    
    gameActive = true;
    message.textContent = `Hráč ${currentPlayer} začíná!`;
    resetButton.style.display = 'none';
}

function handleClick(event) {
    if (!event.target.classList.contains('cell')) return;
    
    const cell = event.target;
    const index = cell.getAttribute('data-index');

    if (!gameActive || boardState[index]) return;

    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);

    if (checkWin()) {
        message.textContent = `Hráč ${currentPlayer} vyhrál!`;
        gameActive = false;
        highlightWinningCells();
        updateScore(currentPlayer);
        resetButton.style.display = 'block';
    } else if (boardState.every(cell => cell)) {
        message.textContent = 'Remíza!';
        gameActive = false;
        resetButton.style.display = 'block';
    } else {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        message.textContent = `Tah hráče ${currentPlayer}`;
    }
}

function checkWin() {
    const winningCombinations = generateWinningCombinations(boardSize, winCondition);
    return winningCombinations.some(combination => 
        combination.every(index => boardState[index] === currentPlayer)
    );
}

function generateWinningCombinations(size, winCondition) {
    const combinations = [];
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            directions.forEach(([dx, dy]) => {
                if (row + (winCondition - 1) * dx < size && 
                    col + (winCondition - 1) * dy < size && 
                    col + (winCondition - 1) * dy >= 0) {
                    combinations.push(
                        Array.from({length: winCondition}, (_, i) => 
                            (row + i * dx) * size + (col + i * dy)
                        )
                    );
                }
            });
        }
    }
    return combinations;
}

function highlightWinningCells() {
    const winningCombination = generateWinningCombinations(boardSize, winCondition)
        .find(combination => combination.every(index => boardState[index] === currentPlayer));
    
    if (winningCombination) {
        winningCombination.forEach(index => 
            document.querySelector(`.cell[data-index="${index}"]`).classList.add('winner')
        );
    }
}

function updateScore(winner) {
    scores.set(winner, scores.get(winner) + 1);
    if (winner === PLAYER_X) {
        scoreX.textContent = scores.get(PLAYER_X);
    } else {
        scoreO.textContent = scores.get(PLAYER_O);
    }
}

function resetGame() {
    currentPlayer = PLAYER_X;
    boardState = Array(boardSize * boardSize).fill(null);
    renderBoard();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Načtení uložené preference tmavého režimu
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

// Event listeners
board.addEventListener('click', handleClick);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Inicializace hry
setBoardSize(5);  // Nastaví výchozí velikost na 5×5
renderBoard();
updateBoardSizeButtons();