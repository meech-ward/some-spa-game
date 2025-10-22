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

// ==================== Sound Manager ====================
class SoundManager {
    constructor() {
        // Initialize Web Audio API context
        this.audioContext = null;
        this.enabled = true;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // Create AudioContext on user interaction (browsers require this)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported', error);
            this.enabled = false;
        }
    }

    /**
     * Play card flip sound (short, light tone)
     */
    playFlip() {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * Play match sound (cheerful, ascending tones)
     */
    playMatch() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)

        notes.forEach((frequency, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, now);

            const startTime = now + (index * 0.1);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    /**
     * Play win sound (triumphant melody)
     */
    playWin() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const melody = [
            { freq: 523.25, start: 0, duration: 0.15 },    // C5
            { freq: 659.25, start: 0.15, duration: 0.15 }, // E5
            { freq: 783.99, start: 0.3, duration: 0.15 },  // G5
            { freq: 1046.5, start: 0.45, duration: 0.4 }   // C6
        ];

        melody.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(note.freq, now);

            const startTime = now + note.start;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);
        });
    }

    /**
     * Resume audio context (required for some browsers)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// ==================== Theme Manager ====================
class ThemeManager {
    constructor() {
        this.darkMode = this.getSavedTheme();
        this.themeToggleBtn = null;
        this.themeIcon = null;
    }

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme() {
        const saved = localStorage.getItem('memoryMatchTheme');
        return saved === 'dark';
    }

    /**
     * Save theme to localStorage
     */
    saveTheme(isDark) {
        localStorage.setItem('memoryMatchTheme', isDark ? 'dark' : 'light');
    }

    /**
     * Initialize theme on page load
     */
    init() {
        this.themeToggleBtn = document.getElementById('themeToggle');

        if (!this.themeToggleBtn) {
            console.warn('Theme toggle button not found');
            return;
        }

        this.themeIcon = this.themeToggleBtn.querySelector('.theme-icon');

        if (!this.themeIcon) {
            console.warn('Theme icon not found');
            return;
        }

        // Apply saved theme
        this.applyTheme(this.darkMode);

        // Add event listener
        this.themeToggleBtn.addEventListener('click', () => this.toggle());
    }

    /**
     * Toggle between light and dark mode
     */
    toggle() {
        this.darkMode = !this.darkMode;
        this.applyTheme(this.darkMode);
        this.saveTheme(this.darkMode);
    }

    /**
     * Apply theme to the page
     */
    applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (this.themeIcon) this.themeIcon.textContent = '☀️';
            if (this.themeToggleBtn) this.themeToggleBtn.setAttribute('aria-label', 'Toggle light mode');
        } else {
            document.body.classList.remove('dark-mode');
            if (this.themeIcon) this.themeIcon.textContent = '🌙';
            if (this.themeToggleBtn) this.themeToggleBtn.setAttribute('aria-label', 'Toggle dark mode');
        }
    }
}

// ==================== High Score Manager ====================
class HighScoreManager {
    constructor() {
        this.storageKey = 'memoryMatchHighScores';
        this.maxScores = 5;
        this.currentDifficulty = 'easy';
        this.scores = this.loadScores();
    }

    /**
     * Load scores from localStorage
     */
    loadScores() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            easy: [],
            medium: [],
            hard: []
        };
    }

    /**
     * Save scores to localStorage
     */
    saveScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }

    /**
     * Add a new score and return if it's a high score
     */
    addScore(difficulty, time, moves) {
        const score = {
            time: time,
            moves: moves,
            date: new Date().toLocaleDateString()
        };

        const difficultyScores = this.scores[difficulty];
        difficultyScores.push(score);

        // Sort by time (ascending), then by moves (ascending)
        difficultyScores.sort((a, b) => {
            if (a.time === b.time) {
                return a.moves - b.moves;
            }
            return a.time - b.time;
        });

        // Keep only top scores
        const isHighScore = difficultyScores.indexOf(score) < this.maxScores;
        this.scores[difficulty] = difficultyScores.slice(0, this.maxScores);

        this.saveScores();
        return isHighScore;
    }

    /**
     * Get scores for a specific difficulty
     */
    getScores(difficulty) {
        return this.scores[difficulty] || [];
    }

    /**
     * Initialize the high scores UI
     */
    init() {
        // Set up tab switching
        document.querySelectorAll('.score-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.switchTab(difficulty);
            });
        });

        // Display initial scores
        this.displayScores(this.currentDifficulty);
    }

    /**
     * Switch between difficulty tabs
     */
    switchTab(difficulty) {
        this.currentDifficulty = difficulty;

        // Update active tab
        document.querySelectorAll('.score-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.difficulty === difficulty);
        });

        this.displayScores(difficulty);
    }

    /**
     * Display scores for a difficulty
     */
    displayScores(difficulty) {
        const scoresList = document.getElementById('highScoresList');
        const scores = this.getScores(difficulty);

        if (scores.length === 0) {
            scoresList.innerHTML = '<p class="no-scores">No high scores yet!</p>';
            return;
        }

        scoresList.innerHTML = scores.map((score, index) => {
            const minutes = Math.floor(score.time / 60);
            const seconds = score.time % 60;
            const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            return `
                <div class="score-item">
                    <span class="score-rank">#${index + 1}</span>
                    <div class="score-info">
                        <span class="score-time">${formattedTime}</span>
                        <span class="score-moves">${score.moves} moves</span>
                    </div>
                    <span class="score-date">${score.date}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Update display after adding a new score
     */
    updateDisplay(difficulty) {
        this.switchTab(difficulty);
    }
}

// ==================== Keyboard Navigation Manager ====================
class KeyboardNavigationManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.currentFocusIndex = 0;
        this.enabled = false;
    }

    /**
     * Enable keyboard navigation
     */
    enable() {
        this.enabled = true;
        this.currentFocusIndex = 0;
        this.updateFocus();
    }

    /**
     * Disable keyboard navigation
     */
    disable() {
        this.enabled = false;
        this.removeFocus();
    }

    /**
     * Get all focusable cards
     */
    getCards() {
        return Array.from(document.querySelectorAll('.card:not(.matched)'));
    }

    /**
     * Update focus to current card
     */
    updateFocus() {
        if (!this.enabled) return;

        const cards = this.getCards();
        if (cards.length === 0) return;

        // Remove focus from all cards
        cards.forEach(card => card.blur());

        // Clamp index
        this.currentFocusIndex = Math.max(0, Math.min(this.currentFocusIndex, cards.length - 1));

        // Focus current card
        if (cards[this.currentFocusIndex]) {
            cards[this.currentFocusIndex].focus();
        }
    }

    /**
     * Remove focus from all cards
     */
    removeFocus() {
        const cards = this.getCards();
        cards.forEach(card => card.blur());
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e, gridColumns) {
        if (!this.enabled) return;

        const cards = this.getCards();
        if (cards.length === 0) return;

        let handled = false;

        switch (e.key) {
            case 'ArrowRight':
                this.currentFocusIndex = (this.currentFocusIndex + 1) % cards.length;
                handled = true;
                break;

            case 'ArrowLeft':
                this.currentFocusIndex = (this.currentFocusIndex - 1 + cards.length) % cards.length;
                handled = true;
                break;

            case 'ArrowDown':
                this.currentFocusIndex = Math.min(cards.length - 1, this.currentFocusIndex + gridColumns);
                handled = true;
                break;

            case 'ArrowUp':
                this.currentFocusIndex = Math.max(0, this.currentFocusIndex - gridColumns);
                handled = true;
                break;

            case 'Enter':
            case ' ':
                // Click the focused card
                const focusedCard = cards[this.currentFocusIndex];
                if (focusedCard) {
                    focusedCard.click();
                    handled = true;
                }
                break;
        }

        if (handled) {
            e.preventDefault();
            this.updateFocus();
        }
    }

    /**
     * Get grid columns for current difficulty
     */
    getGridColumns() {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard.classList.contains('easy')) return 4;
        if (gameBoard.classList.contains('medium')) return 5;
        if (gameBoard.classList.contains('hard')) return 6;
        return 4;
    }
}

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
        card.tabIndex = 0; // Make card focusable for keyboard navigation

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
        this.soundManager = new SoundManager();
        this.themeManager = new ThemeManager();
        this.highScoreManager = new HighScoreManager();
        this.keyboardNav = new KeyboardNavigationManager(this);
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
        // Show difficulty selection panel and high scores
        document.getElementById('difficultyPanel').classList.remove('hidden');
        document.getElementById('highScoresSection').classList.remove('hidden');

        // Hide game board and controls
        document.getElementById('gameBoard').classList.add('hidden');
        const controls = document.querySelector('.controls');
        if (controls) controls.classList.add('hidden');

        this.state.stopTimer();
        this.keyboardNav.disable();
    }

    hideDifficultySelection() {
        // Hide difficulty selection panel
        document.getElementById('difficultyPanel').classList.add('hidden');

        // Show game board, controls, and high scores
        document.getElementById('gameBoard').classList.remove('hidden');
        document.getElementById('highScoresSection').classList.remove('hidden');
        const controls = document.querySelector('.controls');
        if (controls) controls.classList.remove('hidden');
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

        // Enable keyboard navigation
        this.keyboardNav.enable();
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

        // Resume audio context on first user interaction
        this.soundManager.resume();

        // Start timer on first move
        if (this.state.moves === 0) {
            this.state.startTimer();
        }

        // Play flip sound
        this.soundManager.playFlip();

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
            this.soundManager.playMatch();
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
            this.keyboardNav.disable();

            // Add score to high scores
            const isHighScore = this.highScoreManager.addScore(
                this.state.difficulty,
                this.state.timer,
                this.state.moves
            );

            // Update high scores display
            this.highScoreManager.updateDisplay(this.state.difficulty);

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
        this.soundManager.playWin();
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

    // Initialize theme manager
    game.themeManager.init();

    // Initialize high score manager
    game.highScoreManager.init();

    // Add keyboard support for accessibility
    document.addEventListener('keydown', (e) => {
        // ESC to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('winModal');
            if (modal.classList.contains('active')) {
                game.hideWinModal();
            }
            return;
        }

        // Arrow keys and Enter for card navigation
        const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
        if (navigationKeys.includes(e.key)) {
            const gridColumns = game.keyboardNav.getGridColumns();
            game.keyboardNav.handleKeydown(e, gridColumns);
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
