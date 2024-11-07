const board = document.getElementById('board');
const message = document.getElementById('message');
const resetButton = document.getElementById('resetButton');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');

let currentPlayer = 'X';
let gameActive = true;
let boardState = [];
let scores = { X: 0, O: 0 };
let boardSize = 3;
let winCondition = 3;

function setBoardSize(size) {
    boardSize = size;
    winCondition = size === 3 ? 3 : size === 4 ? 4 : 5;
    resetGame();
    renderBoard();
}

function renderBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${boardSize}, 100px)`;
    board.style.gridTemplateRows = `repeat(${boardSize}, 100px)`;

    boardState = Array(boardSize * boardSize).fill(null);
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.style.width = `${100}px`;
        cell.style.height = `${100}px`;
        cell.addEventListener('click', handleClick);
        board.appendChild(cell);
    }
    gameActive = true;
    message.textContent = `Hráč ${currentPlayer} začíná!`;
    resetButton.style.display = 'none';
}

function handleClick(event) {
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
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        message.textContent = `Tah hráče ${currentPlayer}`;
    }
}

function checkWin() {
    const winningCombinations = generateWinningCombinations(boardSize, winCondition);
    return winningCombinations.some(combination => {
        const [a, b, c, d, e] = combination;
        return (
            boardState[a] &&
            boardState[a] === boardState[b] &&
            boardState[b] === boardState[c] &&
            (d === undefined || boardState[c] === boardState[d]) &&
            (e === undefined || boardState[d] === boardState[e])
        );
    });
}

function generateWinningCombinations(size, winCondition) {
    const combinations = [];

    // Horizontální kombinace
    for (let i = 0; i < size * size; i += size) {
        for (let j = 0; j <= size - winCondition; j++) {
            const combination = [];
            for (let k = 0; k < winCondition; k++) {
                combination.push(i + j + k);
            }
            combinations.push(combination);
        }
    }

    // Vertikální kombinace
    for (let i = 0; i < size; i++) {
        for (let j = 0; j <= size - winCondition; j++) {
            const combination = [];
            for (let k = 0; k < winCondition; k++) {
                combination.push(i + (j + k) * size);
            }
            combinations.push(combination);
        }
    }

    // Diagonální kombinace
    for (let i = 0; i <= size - winCondition; i++) {
        for (let j = 0; j <= size - winCondition; j++) {
            const combination1 = [];
            const combination2 = [];
            for (let k = 0; k < winCondition; k++) {
                combination1.push(i * size + j + k * (size + 1));
                combination2.push((i + winCondition - 1) * size + j + k * (size - 1));
            }
            combinations.push(combination1);
            combinations.push(combination2);
        }
    }

    return combinations;
}

function highlightWinningCells() {
    const winningCombinations = generateWinningCombinations(boardSize, winCondition);
    winningCombinations.forEach(combination => {
        const [a, b, c, d, e] = combination;
        if (
            boardState[a] &&
            boardState[a] === boardState[b] &&
            boardState[a] === boardState[c] &&
            (d === undefined || boardState[c] === boardState[d]) &&
            (e === undefined || boardState[d] === boardState[e])
        ) {
            document.querySelector(`.cell[data-index="${a}"]`).classList.add('winner');
            document.querySelector(`.cell[data-index="${b}"]`).classList.add('winner');
            document.querySelector(`.cell[data-index="${c}"]`).classList.add('winner');
            if (d !== undefined) document.querySelector(`.cell[data-index="${d}"]`).classList.add('winner');
            if (e !== undefined) document.querySelector(`.cell[data-index="${e}"]`).classList.add('winner');
        }
    });
}

function updateScore(winner) {
    scores[winner]++;
    if (winner === 'X') {
        scoreX.textContent = scores.X;
    } else {
        scoreO.textContent = scores.O;
    }
}

function resetGame() {
    currentPlayer = 'X';
    boardState = Array(boardSize * boardSize).fill(null);
    renderBoard();
}

renderBoard();
