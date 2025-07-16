document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const newGameBtn = document.getElementById('new-game');
    const fullResetBtn = document.getElementById('full-reset');
    const twoPlayerBtn = document.getElementById('two-player');
    const vsAiBtn = document.getElementById('vs-ai');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const xWinsEl = document.getElementById('x-wins');
    const oWinsEl = document.getElementById('o-wins');
    const xPlayerDisplay = document.getElementById('x-player');
    const oPlayerDisplay = document.getElementById('o-player');
    
    // Game state
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let vsAI = false;
    let aiPlayer = 'O';
    let difficulty = 'medium';
    
    // Scores
    let scores = {
        x: 0,
        o: 0
    };
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize game
    function init() {
        initGameModes();
        initDifficulty();
        updatePlayerDisplay();
        updateScoreboard();
        
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
        
        newGameBtn.addEventListener('click', resetGame);
        fullResetBtn.addEventListener('click', restartGame);
    }
    
    // Initialize game mode buttons
    function initGameModes() {
        twoPlayerBtn.addEventListener('click', () => {
            vsAI = false;
            twoPlayerBtn.classList.add('active');
            vsAiBtn.classList.remove('active');
            resetGame();
        });
        
        vsAiBtn.addEventListener('click', () => {
            vsAI = true;
            twoPlayerBtn.classList.remove('active');
            vsAiBtn.classList.add('active');
            resetGame();
        });
    }
    
    // Initialize difficulty settings
    function initDifficulty() {
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficulty = btn.dataset.difficulty;
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        makeMove(clickedCellIndex, currentPlayer);
        
        // AI move
        if (vsAI && gameActive && currentPlayer === aiPlayer) {
            setTimeout(() => {
                const bestMove = getAIMove();
                if (bestMove !== null) {
                    makeMove(bestMove, aiPlayer);
                }
            }, 500 + Math.random() * 500); // Random delay for more natural feel
        }
    }
    
    // Make a move
    function makeMove(index, player) {
        gameState[index] = player;
        cells[index].textContent = player;
        cells[index].classList.add(player.toLowerCase());
        
        const winner = checkWinner();
        
        if (winner) {
            handleWin(winner);
        } else if (!gameState.includes('')) {
            handleDraw();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updatePlayerDisplay();
            updateStatus();
        }
    }
    
    // Check for winner
    function checkWinner() {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                // Highlight winning cells
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                return gameState[a];
            }
        }
        return null;
    }
    
    // Handle win
    function handleWin(winner) {
        gameActive = false;
        
        if (winner === 'X') {
            scores.x++;
            status.textContent = "PLAYER X VICTORY";
        } else {
            scores.o++;
            status.textContent = "PLAYER O VICTORY";
        }
        
        updateScoreboard();
    }
    
    // Handle draw
    function handleDraw() {
        gameActive = false;
        status.textContent = "DRAW";
    }
    
    // Update player display
    function updatePlayerDisplay() {
        if (currentPlayer === 'X') {
            xPlayerDisplay.classList.add('active');
            oPlayerDisplay.classList.remove('active');
        } else {
            xPlayerDisplay.classList.remove('active');
            oPlayerDisplay.classList.add('active');
        }
    }
    
    // Update status display
    function updateStatus() {
        if (vsAI && currentPlayer === aiPlayer) {
            status.textContent = "AI PROCESSING...";
        } else {
            status.textContent = `PLAYER ${currentPlayer} TURN`;
        }
    }
    
    // Update scoreboard
    function updateScoreboard() {
        xWinsEl.textContent = scores.x;
        oWinsEl.textContent = scores.o;
    }
    
    // Get AI move based on difficulty
    function getAIMove() {
        const emptyCells = gameState.reduce((acc, val, index) => {
            if (val === '') acc.push(index);
            return acc;
        }, []);
        
        if (emptyCells.length === 0) return null;
        
        switch (difficulty) {
            case 'easy':
                // Random move (sometimes makes mistakes)
                if (Math.random() < 0.6) {
                    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
                }
                // Fall through to medium
            case 'medium':
                // Mix of random and smart moves
                if (Math.random() < 0.3) {
                    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
                }
                // Fall through to hard
            case 'hard':
            default:
                // Always optimal moves
                return findBestMove();
        }
    }
    
    // Find best move using minimax algorithm
    function findBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = aiPlayer;
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    // Minimax algorithm
    function minimax(board, depth, isMaximizing) {
        const winner = checkWinnerForMinimax(board);
        
        if (winner === aiPlayer) return 10 - depth;
        if (winner === (aiPlayer === 'X' ? 'O' : 'X')) return depth - 10;
        if (!board.includes('')) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiPlayer;
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiPlayer === 'X' ? 'O' : 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    // Check winner for minimax
    function checkWinnerForMinimax(board) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    // Reset game (keep scores)
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        updatePlayerDisplay();
        updateStatus();
        
        // If it's AI's turn first in single player mode
        if (vsAI && aiPlayer === 'X') {
            setTimeout(() => {
                const bestMove = getAIMove();
                if (bestMove !== null) {
                    makeMove(bestMove, aiPlayer);
                }
            }, 800); // Slightly longer initial delay
        }
    }
    
    // Restart game (reset scores)
    function restartGame() {
        scores = { x: 0, o: 0 };
        updateScoreboard();
        resetGame();
    }
    
    // Start the game
    init();
});