/**
 * Memory Match Game
 * A single-page application game built with vanilla JavaScript
 * following modern best practices and clean code principles
 */

// ==================== Constants ====================
const CARD_SYMBOLS = {
    easy: ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'],
    medium: ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎹', '🎲'],
    hard: ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻', '🎹', '🎲', '🎰', '🎳', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐']
};

const DIFFICULTY_CONFIG = {
    easy: { cards: 16, pairs: 8, gridClass: 'easy' },
    medium: { cards: 20, pairs: 10, gridClass: 'medium' },
    hard: { cards: 36, pairs: 18, gridClass: 'hard' }
};

// ==================== Game State ====================
class GameState {
    constructor() {
        this.difficulty = null;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isProcessing = false;
    }

    reset() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.isProcessing = false;
        this.stopTimer();
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = formattedTime;
    }

    getFormattedTime() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ==================== Card Class ====================
class Card {
    constructor(symbol, id) {
        this.symbol = symbol;
        this.id = id;
        this.isFlipped = false;
        this.isMatched = false;
        this.element = null;
    }

    createElement() {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.cardId = this.id;

        const front = document.createElement('div');
        front.className = 'card-front';
        front.textContent = '?';

        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = this.symbol;

        card.appendChild(front);
        card.appendChild(back);

        this.element = card;
        return card;
    }

    flip() {
        if (!this.isFlipped && !this.isMatched) {
            this.isFlipped = true;
            this.element.classList.add('flipped');
        }
    }

    unflip() {
        if (this.isFlipped && !this.isMatched) {
            this.isFlipped = false;
            this.element.classList.remove('flipped');
        }
    }

    setMatched() {
        this.isMatched = true;
        this.element.classList.add('matched');
    }
}

// ==================== Game Controller ====================
class GameController {
    constructor() {
        this.state = new GameState();
        this.initializeEventListeners();
        this.showDifficultySelection();
    }

    initializeEventListeners() {
        // Difficulty selection
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.startNewGame(difficulty);
            });
        });

        // Control buttons
        document.getElementById('restartBtn').addEventListener('click', () => {
            if (this.state.difficulty) {
                this.startNewGame(this.state.difficulty);
            }
        });

        document.getElementById('changeDifficultyBtn').addEventListener('click', () => {
            this.showDifficultySelection();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideWinModal();
            if (this.state.difficulty) {
                this.startNewGame(this.state.difficulty);
            }
        });
    }

    showDifficultySelection() {
        document.getElementById('difficultyPanel').classList.remove('hidden');
        document.getElementById('gameBoard').classList.add('hidden');
        this.state.stopTimer();
    }

    hideDifficultySelection() {
        document.getElementById('difficultyPanel').classList.add('hidden');
        document.getElementById('gameBoard').classList.remove('hidden');
    }

    startNewGame(difficulty) {
        this.state.difficulty = difficulty;
        this.state.reset();
        this.hideDifficultySelection();
        this.createGameBoard();
        this.updateStats();
    }

    createGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        const config = DIFFICULTY_CONFIG[this.state.difficulty];
        gameBoard.className = `game-board ${config.gridClass}`;

        // Generate card pairs
        const symbols = CARD_SYMBOLS[this.state.difficulty].slice(0, config.pairs);
        const cardSymbols = [...symbols, ...symbols]; // Create pairs

        // Shuffle cards using Fisher-Yates algorithm
        this.shuffleArray(cardSymbols);

        // Create card objects
        this.state.cards = cardSymbols.map((symbol, index) => {
            const card = new Card(symbol, index);
            const cardElement = card.createElement();

            cardElement.addEventListener('click', () => this.handleCardClick(card));
            gameBoard.appendChild(cardElement);

            return card;
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleCardClick(card) {
        // Prevent clicking during processing or on already flipped/matched cards
        if (this.state.isProcessing || card.isFlipped || card.isMatched) {
            return;
        }

        // Start timer on first move
        if (this.state.moves === 0) {
            this.state.startTimer();
        }

        card.flip();
        this.state.flippedCards.push(card);

        if (this.state.flippedCards.length === 2) {
            this.state.moves++;
            this.updateStats();
            this.checkForMatch();
        }
    }

    checkForMatch() {
        this.state.isProcessing = true;
        const [card1, card2] = this.state.flippedCards;

        if (card1.symbol === card2.symbol) {
            // Match found!
            setTimeout(() => {
                card1.setMatched();
                card2.setMatched();
                this.state.matchedPairs++;
                this.state.flippedCards = [];
                this.state.isProcessing = false;
                this.updateStats();
                this.checkWinCondition();
            }, 600);
        } else {
            // No match, flip back
            setTimeout(() => {
                card1.unflip();
                card2.unflip();
                this.state.flippedCards = [];
                this.state.isProcessing = false;
            }, 1000);
        }
    }

    checkWinCondition() {
        const config = DIFFICULTY_CONFIG[this.state.difficulty];
        if (this.state.matchedPairs === config.pairs) {
            this.state.stopTimer();
            setTimeout(() => {
                this.showWinModal();
            }, 500);
        }
    }

    updateStats() {
        document.getElementById('moves').textContent = this.state.moves;
        const config = DIFFICULTY_CONFIG[this.state.difficulty];
        document.getElementById('matches').textContent =
            `${this.state.matchedPairs}/${config.pairs}`;
    }

    showWinModal() {
        document.getElementById('finalMoves').textContent = this.state.moves;
        document.getElementById('finalTime').textContent = this.state.getFormattedTime();
        document.getElementById('winModal').classList.add('active');
    }

    hideWinModal() {
        document.getElementById('winModal').classList.remove('active');
    }
}

// ==================== Initialize Game ====================
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();

    // Add keyboard support for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('winModal');
            if (modal.classList.contains('active')) {
                game.hideWinModal();
            }
        }
    });
});

// ==================== Service Worker Registration (Optional) ====================
// Uncomment the following code to enable offline capabilities
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed'));
    });
}
*/
