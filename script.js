const PLAYER_X = 'X';
const PLAYER_O = 'O';

const { 
    board, 
    message, 
    resetButton, 
    scoreX, 
    scoreO, 
    darkModeToggle,
    languageToggle,
    resetScoreButton,
    confirmDialog,
    confirmYes,
    confirmNo
} = {
    board: document.getElementById('board'),
    message: document.getElementById('message'),
    resetButton: document.getElementById('resetButton'),
    scoreX: document.getElementById('scoreX'),
    scoreO: document.getElementById('scoreO'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    languageToggle: document.getElementById('languageToggle'),
    resetScoreButton: document.getElementById('resetScoreButton'),
    confirmDialog: document.getElementById('confirmDialog'),
    confirmYes: document.getElementById('confirmYes'),
    confirmNo: document.getElementById('confirmNo')
};

let currentPlayer = PLAYER_X;
let gameActive = true;
let boardState = [];
let currentLanguage = 'cs';
const scores = new Map([[PLAYER_X, 0], [PLAYER_O, 0]]);
let boardSize = 5;  // Výchozí velikost 5×5
let winCondition = 5;  // Výchozí podmínka výhry 5 polí

const translations = {
    cs: {
        playerStart: 'Hráč X začíná!',
        playerTurn: 'Tah hráče',
        playerWon: 'Hráč',
        won: 'vyhrál!',
        draw: 'Remíza!',
        playAgain: 'Hrát znovu',
        score: 'Skóre',
        resetScore: 'Resetovat skóre',
        boardSize: 'Velikost hrací plochy:',
        winCondition: 'Počet polí pro výhru:',
        confirmReset: 'Opravdu chcete resetovat skóre?',
        yes: 'Ano',
        no: 'Ne',
        scoreX: 'X',
        scoreO: 'O'
    },
    en: {
        playerStart: 'Player X starts!',
        playerTurn: "Player's turn",
        playerWon: 'Player',
        won: 'won!',
        draw: 'Draw!',
        playAgain: 'Play Again',
        score: 'Score',
        resetScore: 'Reset Score',
        boardSize: 'Board Size:',
        winCondition: 'Win Condition:',
        confirmReset: 'Do you really want to reset the score?',
        yes: 'Yes',
        no: 'No',
        scoreX: 'X',
        scoreO: 'O'
    }
};

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
    for (let i = 0; i < boardState.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.fontSize = boardSize === 15 ? '1.2em' : '2em';
        board.appendChild(cell);
    }
    
    gameActive = true;
    message.textContent = translations[currentLanguage].playerStart;
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
        message.textContent = `${translations[currentLanguage].playerWon} ${currentPlayer} ${translations[currentLanguage].won}`;
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
        message.textContent = `${translations[currentLanguage].playerTurn} ${currentPlayer}`;
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
        winningCombination. forEach(index => {
            const cell = board.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning-cell');
        });
    }
}

function resetGame() {
    boardState = Array(boardSize * boardSize).fill(null);
    currentPlayer = PLAYER_X;
    gameActive = true;
    message.textContent = translations[currentLanguage].playerStart;
    resetButton.style.display = 'none';
    renderBoard();
}

function updateTranslations() {
    document.querySelector('.scoreboard').firstChild.textContent = `${translations[currentLanguage].score} - `;
    scoreX.textContent = `${translations[currentLanguage].scoreX}: ${scores.get(PLAYER_X)}`;
    scoreO.textContent = `${translations[currentLanguage].scoreO}: ${scores.get(PLAYER_O)}`;
}

function updateScore(winner) {
    scores.set(winner, scores.get(winner) + 1);
    scoreX.textContent = `${translations[currentLanguage].scoreX}: ${scores.get(PLAYER_X)}`;
    scoreO.textContent = `${translations[currentLanguage].scoreO}: ${scores.get(PLAYER_O)}`;
}

resetButton.addEventListener('click', resetGame);
board.addEventListener('click', handleClick);
resetScoreButton.addEventListener('click', () => {
    confirmDialog.style.display = 'block';
});

confirmYes.addEventListener('click', () => {
    scores.set(PLAYER_X, 0);
    scores.set(PLAYER_O, 0);
    updateTranslations();
    confirmDialog.style.display = 'none';
});

confirmNo.addEventListener('click', () => {
    confirmDialog.style.display = 'none';
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'cs' ? 'en' : 'cs';
    updateTranslations();
    resetGame();
});

setBoardSize(boardSize);
updateTranslations();