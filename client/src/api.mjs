const SERVER_URL = 'http://localhost:3001/api';
export const API = {};

// ========== AUTH ==========

// Login
API.login = async (credentials) => {
    const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        return await response.json();
    } else {
        const errDetails = await response.json();
        throw new Error(errDetails.error || 'Login failed');
    }
};

// Logout
API.logout = async () => {
    const response = await fetch(`${SERVER_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.error || 'Logout failed');
    }
};

// Check session
API.isLoggedIn = async () => {
    const response = await fetch(`${SERVER_URL}/auth/current`, {
        credentials: 'include'
    });
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
};

// ========== GAME ==========

// Start a new game
API.startGame = async () => {
    const response = await fetch(`${SERVER_URL}/games/start`, {
        method: 'POST',
        credentials: 'include',
    });
    if (response.ok) {
        const game = await response.json();

        return {
            game: {
                id: game.gameId,
                status: 'ongoing',
                created_at: game.started_at
            },
            cards: game.initialCards.map(card => ({
                ...card,
                won: true,
                initial_card: true
            }))
        };
    } else {
        throw new Error('Unable to start game');
    }
};

// Get current game
API.getCurrentGame = async () => {
    const response = await fetch(`${SERVER_URL}/games/current`, {
        credentials: 'include',
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else if (response.status === 404) {
        return null;  // Nessuna partita in corso
    } else {
        throw new Error('Error loading current game');
    }
};

// Submit a guess
API.submitGuess = async ({ gameId, guessCardId, position, timeout }) => {
    const response = await fetch(`${SERVER_URL}/games/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gameId, guessCardId, position, timeout }),
    });
    const result = await response.json();
    if (response.ok) {
        return {
            ...result,
            correctIndex: result.correctPos 
        };
    } else {
        throw new Error(result.error || 'Guess submission failed');
    }
};

// Next round
API.nextRound = async () => {
    const response = await fetch(`${SERVER_URL}/games/next-round`, {
        method: 'POST',
        credentials: 'include',
    });
    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw new Error(data.error || 'Next round error');
    }
};

// Game history
API.getGameHistory = async () => {
    const response = await fetch(`${SERVER_URL}/games/history`, {
        credentials: 'include',
    });
    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw new Error(data.error || 'History fetch failed');
    }
};

// ========== DEMO ==========

// Start a demo game
API.startDemo = async () => {
    const response = await fetch(`${SERVER_URL}/cards/demo`);
    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw new Error(data.error || 'Demo game error');
    }
};

// Submit demo guess
API.submitDemoGuess = async ({ initialCards, guessCardId, position, timeout }) => {
    const response = await fetch(`${SERVER_URL}/cards/demo/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialCards, guessCardId, position, timeout }),
    });
    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw new Error(data.error || 'Demo guess failed');
    }
};
