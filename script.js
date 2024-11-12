const PLAYER_X = 'X';
const PLAYER_O = 'O';

const { 
    board, 
    message, 
    resetButton, 
    scoreX, 
    scoreO, 
    darkModeToggle,
    resetScoreButton,
    confirmDialog,
    confirmYes,
    confirmNo,
    languageToggle
} = {
    board: document.getElementById('board'),
    message: document.getElementById('message'),
    resetButton: document.getElementById('resetButton'),
    scoreX: document.getElementById('scoreX'),
    scoreO: document.getElementById('scoreO'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    resetScoreButton: document.getElementById('resetScoreButton'),
    confirmDialog: document.getElementById('confirmDialog'),
    confirmYes: document.getElementById('confirmYes'),
    confirmNo: document.getElementById('confirmNo'),
    languageToggle: document.getElementById('languageToggle')
};

let currentPlayer = PLAYER_X;
let gameActive = true;
let boardState = [];
const scores = new Map([[PLAYER_X, 0], [PLAYER_O, 0]]);
let boardSize = 5;  // Výchozí velikost 5×5
let winCondition = 5;  // Výchozí podmínka výhry 5 polí
let currentLanguage = 'cs'; // Výchozí jazyk je čeština

const translations = {
    cs: {
        playerXStarts: "Hráč X začíná!",
        playerOStarts: "Hráč O začíná!",
        playerXTurn: "Tah hráče X",
        playerOTurn: "Tah hráče O",
        playerXWins: "Hráč X vyhrál!",
        playerOWins: "Hráč O vyhrál!",
        draw: "Remíza!",
        playAgain: "Hrát znovu",
        score: "Skóre",
        resetScore: "Resetovat skóre",
        confirmResetScore: "Opravdu chcete resetovat skóre?",
        yes: "Ano",
        no: "Ne",
        boardSize: "Velikost hrací plochy:",
        winCondition: "Počet polí pro výhru:"
    },
    en: {
        playerXStarts: "Player X starts!",
        playerOStarts: "Player O starts!",
        playerXTurn: "Player X's turn",
        playerOTurn: "Player O's turn",
        playerXWins: "Player X wins!",
        playerOWins: "Player O wins!",
        draw: "It's a draw!",
        playAgain: "Play Again",
        score: "Score",
        resetScore: "Reset Score",
        confirmResetScore: "Are you sure you want to reset the score?",
        yes: "Yes",
        no: "No",
        boardSize: "Board size:",
        winCondition: "Win condition:"
    }
};

function updateTexts() {
    resetButton.textContent = translations[currentLanguage].playAgain;
    resetScoreButton.textContent = translations[currentLanguage].resetScore;
    confirmYes.textContent = translations[currentLanguage].yes;
    confirmNo.textContent = translations[currentLanguage].no;
    document.querySelector('.score-text').textContent = `${translations[currentLanguage].score} - `;
    document.querySelector('.board-size-buttons .size-label').textContent = translations[currentLanguage].boardSize;
    document.querySelector('.win-condition-buttons .size-label').textContent = translations[currentLanguage].winCondition;
    document.querySelector('.confirm-dialog-content p').textContent = translations[currentLanguage].confirmResetScore;
}

function setBoardSize(size) {
    boardSize = size;
    if (size === 3) {
        winCondition = 3;
    } else if (size === 4) {
        winCondition = 4;
    } else {
        winCondition = 5;
    }
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
    if (condition <= boardSize) {
        winCondition = condition;
        resetGame();
        renderBoard();
        updateWinConditionButtons();
    }
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
        button.disabled = condition > boardSize;
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
    message .textContent = translations[currentLanguage][currentPlayer === PLAYER_X ? 'playerXStarts' : 'playerOStarts'];
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
        message.textContent = translations[currentLanguage][currentPlayer === PLAYER_X ? 'playerXWins' : 'playerOWins'];
        gameActive = false;
        highlightWinningCells();
        updateScore(currentPlayer);
        resetButton.style.display = 'block';
    } else if (boardState.every(cell => cell)) {
        message.textContent = translations[currentLanguage].draw;
        gameActive = false;
        resetButton.style.display = 'block';
    } else {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        message.textContent = translations[currentLanguage][currentPlayer === PLAYER_X ? 'playerXTurn' : 'playerOTurn'];
    }
}

function checkWin() {
    const winningCombinations = generateWinningCombinations(boardSize, winCondition);
    return winningCombinations.some(combination => 
        combination.every(index => boardState[index] === currentPlayer)
    );
}

function generateWinningCombinations(size, winCondition) {
    const winningCombinations = [];

    // Rows
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winCondition; col++) {
            const combination = [];
            for (let i = 0; i < winCondition; i++) {
                combination.push(row * size + (col + i));
            }
            winningCombinations.push(combination);
        }
    }

    // Columns
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winCondition; row++) {
            const combination = [];
            for (let i = 0; i < winCondition; i++) {
                combination.push((row + i) * size + col);
            }
            winningCombinations.push(combination);
        }
    }

    // Diagonals (top-left to bottom-right)
    for (let row = 0; row <= size - winCondition; row++) {
        for (let col = 0; col <= size - winCondition; col++) {
            const combination = [];
            for (let i = 0; i < winCondition; i++) {
                combination.push((row + i) * size + (col + i));
            }
            winningCombinations.push(combination);
        }
    }

    // Diagonals (top-right to bottom-left)
    for (let row = 0; row <= size - winCondition; row++) {
        for (let col = winCondition - 1; col < size; col++) {
            const combination = [];
            for (let i = 0; i < winCondition; i++) {
                combination.push((row + i) * size + (col - i));
            }
            winningCombinations.push(combination);
        }
    }

    return winningCombinations;
}

function highlightWinningCells() {
    const winningCombinations = generateWinningCombinations(boardSize, winCondition);
    const winningCombination = winningCombinations.find(combination => 
        combination.every(index => boardState[index] === currentPlayer)
    );

    if (winningCombination) {
        winningCombination.forEach(index => {
            const cell = board.querySelector(`.cell[data-index='${index}']`);
            cell.classList.add('winner');
        });
    }
}

function updateScore(winner) {
    scores.set(winner, scores.get(winner) + 1);
    scoreX.textContent = `${scores.get(PLAYER_X)}`;
    scoreO.textContent = `${scores.get(PLAYER_O)}`;
}

function resetGame() {
    boardState = Array(boardSize * boardSize).fill(null);
    currentPlayer = PLAYER_X;
    gameActive = true;
    renderBoard();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function confirmResetScore() {
    confirmDialog.style.display = 'block';
}

function resetScore() {
    scores.set(PLAYER_X, 0);
    scores.set(PLAYER_O, 0);
    scoreX.textContent = `${scores.get(PLAYER_X)}`;
    scoreO.textContent = `${scores.get(PLAYER_O)}`;
    confirmDialog.style.display = 'none';
}

function closeConfirmDialog() {
    confirmDialog.style.display = 'none';
}

function initializeButtons() {
    updateBoardSizeButtons();
    updateWinConditionButtons();
}

// Event Listeners
board.addEventListener('click', handleClick);
resetButton.addEventListener('click', resetGame);
darkModeToggle.addEventListener('click', toggleDarkMode);
resetScoreButton.addEventListener('click', confirmResetScore);
confirmYes.addEventListener('click', resetScore);
confirmNo.addEventListener('click', closeConfirmDialog);

languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'cs' ? 'en' : 'cs';
    updateTexts();
    renderBoard();

    document.title = currentLanguage === 'cs' ? 'Piškvorky' : 'Tic Tac Toe';
});

// Initial setup
updateTexts();
renderBoard();
initializeButtons();