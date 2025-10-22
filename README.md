# Memory Match Game

A modern, fully-functional single-page application (SPA) memory card matching game built with vanilla JavaScript, HTML5, and CSS3.

## Features

- **Three Difficulty Levels**: Easy (4x4), Medium (4x5), and Hard (6x6)
- **Real-time Statistics**: Track moves, time, and matches
- **Sound Effects**: Dynamic audio feedback using Web Audio API
  - Card flip sounds
  - Match confirmation sounds
  - Victory celebration melody
- **Dark/Light Mode**: Toggle between themes with preference persistence
- **High Score System**: Track top 5 scores per difficulty level
  - Persisted in localStorage
  - View scores for each difficulty
  - Sorted by completion time and moves
- **Keyboard Accessibility**: Full keyboard navigation support
  - Arrow keys to navigate between cards
  - Enter/Space to flip cards
  - ESC to close modals
- **Smooth Animations**: Card flips, match effects, and theme transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Win Detection**: Celebrates victory with a modal displaying game stats
- **Clean Code Architecture**: Object-oriented design with separation of concerns

## How to Play

1. Open `index.html` in your web browser
2. Select a difficulty level (Easy, Medium, or Hard)
3. Click on cards to flip them and reveal symbols (or use keyboard navigation)
4. Match all pairs of identical symbols
5. Try to complete the game in the fewest moves and shortest time!
6. Check the high scores to see how you rank!

### Controls

**Mouse/Touch:**
- Click cards to flip them
- Click the moon/sun icon to toggle dark mode
- Click difficulty tabs to view different high scores

**Keyboard:**
- Arrow keys (↑ ↓ ← →) to navigate between cards
- Enter or Space to flip a card
- ESC to close the victory modal

## Game Rules

- Click (or press Enter on) two cards to flip them
- If they match, they stay flipped
- If they don't match, they flip back
- Continue until all pairs are matched
- Timer starts on your first move
- Your score is saved if it ranks in the top 5 for that difficulty!

## Technical Implementation

### Architecture

The game follows modern web development best practices:

- **MVC-inspired Pattern**: Separation of game state, logic, and presentation
- **Object-Oriented Design**: Multiple specialized classes
  - `GameState`: Manages game state and timer
  - `Card`: Represents individual card logic
  - `GameController`: Main game flow orchestrator
  - `SoundManager`: Web Audio API sound effects
  - `ThemeManager`: Dark/light mode with localStorage
  - `HighScoreManager`: Score tracking and persistence
  - `KeyboardNavigationManager`: Accessibility navigation
- **Event-Driven**: Responsive to user interactions with proper event handling
- **Modular CSS**: Organized with clear sections and CSS variables
- **LocalStorage Integration**: Theme and high scores persist across sessions

### File Structure

```
.
├── index.html      # Main HTML structure (semantic HTML5)
├── styles.css      # All styling (CSS Grid, Flexbox, animations)
├── game.js         # Game logic and state management
└── README.md       # Documentation
```

### Key Technologies

- **HTML5**: Semantic markup with accessibility in mind
- **CSS3**:
  - CSS Grid for responsive card layout
  - Flexbox for component alignment
  - CSS Variables for theming
  - CSS Animations for smooth transitions
  - Media queries for responsive design
- **JavaScript (ES6+)**:
  - Classes for object-oriented design
  - Arrow functions
  - Template literals
  - Destructuring
  - Modern array methods
  - DOM manipulation
  - Web Audio API for sound effects
  - LocalStorage API for persistence

### Best Practices Implemented

1. **Clean Code**: Clear naming conventions, comments, and documentation
2. **Separation of Concerns**: Logic, state, and presentation are separated
3. **DRY Principle**: Reusable functions and components
4. **Responsive Design**: Mobile-first approach with breakpoints
5. **Accessibility**: Keyboard support and semantic HTML
6. **Performance**: Efficient DOM manipulation and event handling
7. **State Management**: Centralized game state in `GameState` class
8. **Fisher-Yates Shuffle**: Proper randomization algorithm

## Browser Compatibility

Works on all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

No build tools or dependencies required! Simply open `index.html` in a browser to play.

### Optional Enhancements

The codebase includes commented code for:
- Service Worker registration for offline capabilities
- Progressive Web App (PWA) support

## Performance

- Lightweight: ~40KB total (uncompressed)
- No external dependencies
- Fast load times
- Smooth 60fps animations
- Efficient Web Audio API usage
- LocalStorage for persistent data

## License

This project is open source and available for educational purposes.

## Credits

Built with modern web technologies as a demonstration of single-page application development best practices.
