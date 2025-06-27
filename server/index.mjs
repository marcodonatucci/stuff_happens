import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import * as controller from './controller.mjs';

// percorso alle immagini delle carte
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// ================== MIDDLEWARES ==================
app.use(express.json());
app.use(morgan('dev'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

// Session configuration
app.use(session({
    secret: 'stuff-happens',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.authenticate('session'));

// ================== PASSPORT CONFIGURATION ==================
passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        const user = await controller.login(username, password);
        if (!user) {
            return cb(null, false, { message: 'Invalid credentials' });
        }
        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(async function (id, cb) {
    try {
        const user = await controller.getCurrentUser(id);
        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
});

// ================== MIDDLEWARE FUNCTIONS ==================
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
};

const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ 
            error: errors.array().map(e => e.msg).join(', ') 
        });
    }
    return next();
};

// ================== AUTH ROUTES ==================

// POST /api/auth/login - User login
app.post('/api/auth/login', 
    [
        check('username').notEmpty().withMessage('Username required'),
        check('password').notEmpty().withMessage('Password required')
    ],
    checkValidation,
    (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ error: info.message || 'Invalid credentials' });
            }
            
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(200).json({
                    id: user.id,
                    username: user.username
                });
            });
        })(req, res, next);
    }
);

// POST /api/auth/logout - User logout
app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.status(200).json({ message: 'Successfully logged out' });
    });
});

// GET /api/auth/current - Check current session
app.get('/api/auth/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            id: req.user.id,
            username: req.user.username
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// ================== GAME ROUTES ==================

// POST /api/games/start
app.post('/api/games/start', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
        const game = await controller.startGame(userId);
        res.status(201).json(game);
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/games/current
app.get('/api/games/current', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
        const game = await controller.getCurrentGame(userId);
        
        if (!game) {
            return res.status(404).json({ error: 'Current game not found' });
        }
        
        res.status(200).json(game);
    } catch (error) {
        console.error('Error fetching current game:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/games/guess
app.post('/api/games/guess', 
    isLoggedIn,
    [
        check('gameId').isInt({ min: 1 }).withMessage('Invalid game id'),
        check('guessCardId').isInt({ min: 1 }).withMessage('Invalid card id'),
        check('position').isInt({ min: 0 }).optional().withMessage('Invalid position'),
        check('timeout').isBoolean().withMessage('Invalid timeout value')
    ],
    checkValidation,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { gameId, guessCardId, position, timeout } = req.body;
            const result = await controller.guessCard(userId, { 
                gameId, 
                guessCardId, 
                position, 
                timeout 
            });
            
            if (result.error) {
                return res.status(400).json({ error: result.error });
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error submitting guess:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// POST /api/games/next-round - Confirm to start next round
app.post('/api/games/next-round', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
        const game = await controller.getCurrentGame(userId);
        if (!game || game.game.status !== 'ongoing') {
            return res.status(400).json({ error: 'The game is already finished' });
        }
        const nextCard = await controller.getNextGuessCard(game.game.id);
        if (!nextCard) {
            return res.status(404).json({ error: 'No more cards available' });
        }
        res.status(200).json(nextCard);
    } catch (error) {
        console.error('Error starting next round:', error);
        res.status(500).json({ error: 'Error starting next round' });
    }
});

// GET /api/games/history - User game history
app.get('/api/games/history', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await controller.getGameHistory(userId);
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Unable to fetch history' });
    }
});

// ================== CARDS ROUTES ==================

// GET /api/cards/demo - Demo game for anonymous users (1 round)
app.get('/api/cards/demo', async (req, res) => {
    try {
        const demoGame = await controller.startDemoGame();
        res.status(200).json(demoGame);
    } catch (error) {
        console.error('Demo error:', error);
        res.status(500).json({ error: 'Unable to create demo game' });
    }
});

// POST /api/cards/demo/guess - Guess for demo game
app.post('/api/cards/demo/guess',
    [
        check('position').isInt({ min: 0 }).withMessage('Invalid position'),
        check('initialCards').isArray({ min: 3 }).withMessage('Initial cards required'),
        check('guessCardId').isInt({ min: 1 }).withMessage('Guess card id required')
    ],
    checkValidation,
    async (req, res) => {
        try {
            const { initialCards, guessCardId, position, timeout } = req.body;
            const result = await controller.guessDemoCard(initialCards, guessCardId, position, timeout);
            if (result.error === 'Card not found') {
                return res.status(404).json({ error: 'Card not found' });
            }
            res.status(200).json(result);
        } catch (error) {
            console.error('Demo guess error:', error);
            res.status(500).json({ error: 'Error during demo guess' });
        }
    }
);

// ================== SERVER START ==================
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
