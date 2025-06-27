# Stuff Happens Game
*A web-based card game where players must correctly position misfortune cards by severity*

## 🎯 Game Description

Stuff Happens is an engaging card-based game that challenges players to correctly position misfortune cards based on their severity index. Players must think strategically about the relative impact of various unfortunate events and place new cards in the correct position among their existing collection.

### 🎮 Game Rules & Mechanics
- **Objective**: Collect 6 cards total by correctly positioning new cards
- **Initial Setup**: Players start with 3 randomly selected cards arranged by severity
- **Gameplay**: Each round presents a new card with 30 seconds to decide its position
- **Scoring**: Correct placement adds the card to your collection
- **Lives**: Players have 3 chances - incorrect placements or timeouts cost a life
- **Victory**: Successfully collect 6 cards (3 initial + 3 earned)
- **Defeat**: Lose all 3 lives through mistakes or timeouts
- **Demo Mode**: Single round experience for anonymous users

### 🌟 Key Features
- **Real-time Timer**: 30-second countdown with visual feedback
- **Responsive Design**: Optimized for desktop and mobile devices
- **User Authentication**: Secure session-based login system
- **Game History**: Track past performances and statistics
- **Demo Mode**: Try the game without registration
- **Progressive Difficulty**: Each correct guess makes subsequent decisions more challenging

## � Application Routes

| Route | Description | Authentication |
|-------|-------------|----------------|
| `/` | Homepage with game options | Public |
| `/login` | User authentication | Public |
| `/game` | Main gameplay interface | Public (demo) / Protected (full game) |
| `/profile` | Game history and statistics | Protected |
| `/result` | Game outcome and summary | Public |
| `/rules` | Game instructions | Public |
| `*` | 404 error page | Public |

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation & Setup

#### Server Setup
```bash
cd server
npm install
node db/init_db.js    # Initialize database with sample data
npm start             # Server runs on http://localhost:3001
```

#### Client Setup
```bash
cd client
npm install
npm run dev           # Client runs on http://localhost:5173
```

### Running the Application
1. **Start the backend server** (must be first)
2. **Start the frontend client**
3. **Open browser** to http://localhost:5173
4. **Register/Login** or try the demo mode

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing with nested routes
- **React Bootstrap** - Responsive UI components
- **Context API** - Centralized state management
- **CSS3** - Custom styling with Bootstrap integration

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite3** - Lightweight embedded database
- **Passport.js** - Authentication middleware with local strategy
- **express-session** - Session management
- **express-validator** - Input validation and sanitization
- **crypto** - Password hashing with scrypt
- **dayjs** - Date manipulation and formatting

### Security & Performance
- **CORS** - Cross-origin resource sharing configuration
- **CSP Compliance** - Content Security Policy adherent timer implementation
- **Password Hashing** - Secure scrypt with random salt
- **Session Security** - HttpOnly cookies and session management
- **Input Validation** - Server-side validation for all endpoints


## API Server

- **POST `/api/auth/login`**
  - Request body: 
```json
{
  "username": "student1",
  "password": "password1"
}
```
  - Response: 
```json
{
  "id": 1,
  "username": "student1"
}
```
on success, error message on failure

- **POST `/api/auth/logout`**
  - Logs out the current user (session-based)
  - Response: 
```json
  { "message": "Successfully logged out" }
```

- **GET `/api/auth/current`**
  - Returns the current authenticated user (if any)
  - Response: 
```json
{
  "id": 1,
  "username": "student1"
}
``` 
or error

- **POST `/api/games/start`**
  - Starts a new game for the authenticated user
  - Response:
```json
{
  "gameId": 17,
  "initialCards": [
    {
      "id": 10,
      "name": "Forget to register for the exam",
      "image_url": "http://localhost:3001/assets/card10.png",
      "misfortune_index": 19,
      "theme": "university life"
    },
    {
      "id": 32,
      "name": "Photos of a university party go viral",
      "image_url": "http://localhost:3001/assets/card32.png",
      "misfortune_index": 63,
      "theme": "university life"
    },
    {
      "id": 48,
      "name": "Bag stolen from the university library",
      "image_url": "http://localhost:3001/assets/card48.png",
      "misfortune_index": 95,
      "theme": "university life"
    }
  ],
  "started_at": "2025-06-03 12:21:20"
}
``` 

- **GET `/api/games/current`**
  - Gets the current ongoing game for the authenticated user
  - Response: 
```json
{
  "gameId": 4,
  "initialCards": [
    {
      "id": 7,
      "name": "Study group doesn’t show up",
      "image_url": "http://localhost:3001/assets/card7.png",
      "misfortune_index": 13,
      "theme": "university life",
      "won": true,
      "round_number": null,
      "initial_card": true
    },
    {
      "id": 15,
      "name": "Surprise question during oral exam",
      "image_url": "http://localhost:3001/assets/card15.png",
      "misfortune_index": 29,
      "theme": "university life",
      "won": true,
      "round_number": null,
      "initial_card": true
    },
    {
      "id": 31,
      "name": "Present wrong slide deck to an external evaluator",
      "image_url": "http://localhost:3001/assets/card31.png",
      "misfortune_index": 61,
      "theme": "university life",
      "won": true,
      "round_number": null,
      "initial_card": true
    }
  ]
}
``` 
 or error

- **POST `/api/games/guess`**
  - Submit a guess for the current round
  - Request body: 
```json
{
  "gameId": 3,
  "guessCardId": 13,
  "position": 2,
  "timeout": false
}
``` 
  - Response: 
```json
{
  "isCorrect": false,
  "correctPos": 1,
  "status": "ongoing",
  "outcome": null,
  "timeout": false
}
``` 
or error

- **POST `/api/games/next-round`**
  - Moves to the next round in the current game
  - Response: 
```json
{
  "id": 41,
  "name": "Campus floods the week of exams",
  "image_url": "http://localhost:3001/assets/card41.png"
}
``` 
 (next card to guess) or error

- **GET `/api/games/history`**
  - Returns the history of all games for the authenticated user
  - Response: 
```json
[
  {
    "game": {
      "id": 17,
      "status": "ongoing",
      "outcome": null,
      "started_at": "2025-06-03 12:21:20"
    },
    "cards": [
      {
        "id": 10,
        "name": "Forget to register for the exam",
        "image_url": "http://localhost:3001/assets/card10.png",
        "misfortune_index": 19,
        "theme": "university life",
        "won": true,
        "round_number": null,
        "initial_card": true
      },
      {
        "id": 32,
        "name": "Photos of a university party go viral",
        "image_url": "http://localhost:3001/assets/card32.png",
        "misfortune_index": 63,
        "theme": "university life",
        "won": true,
        "round_number": null,
        "initial_card": true
      },
      {
        "id": 48,
        "name": "Bag stolen from the university library",
        "image_url": "http://localhost:3001/assets/card48.png",
        "misfortune_index": 95,
        "theme": "university life",
        "won": true,
        "round_number": null,
        "initial_card": true
      },
      {
        "id": 13,
        "name": "Lose your wallet at the cafeteria",
        "image_url": "http://localhost:3001/assets/card13.png",
        "misfortune_index": 25,
        "theme": "university life",
        "won": false,
        "round_number": 1,
        "initial_card": false
      }
    ]
  },
  {
    "game": {
      "id": 16,
      "status": "ongoing",
      "outcome": null,
      "started_at": "2025-06-03 11:30:42"
    },
    "cards": [
      {
        "id": 9,
        "name": "Go to the wrong exam room",
        "image_url": "http://localhost:3001/assets/card9.png",
        "misfortune_index": 17,
        "theme": "university life",
        "won": true,
        "round_number": null,
        "initial_card": true
      },
      {
        "id": 15,
        "name": "Surprise question during oral exam",
        "image_url": "http://localhost:3001/assets/card15.png",
        "misfortune_index": 29,
        "theme": "university life",
        "won": true,
        "round_number": null,
        "initial_card": true
      },
      {
        "id": 44,
        "name": "Ticket to graduation ceremony goes missing",
        "image_url": "http://localhost:3001/assets/card44.png",
        "misfortune_index": 87,
        "theme": "university life",
        "won": true,
        "round_number": null,
        "initial_card": true
      },
      {
        "id": 38,
        "name": "University cafeteria strike",
        "image_url": "http://localhost:3001/assets/card38.png",
        "misfortune_index": 75,
        "theme": "university life",
        "won": true,
        "round_number": 1,
        "initial_card": false
      }
    ]
  }
]
``` 

- **GET `/api/cards/demo`**
  - Returns a demo game for anonymous users (3 initial cards + 1 card to guess)
  - Response: 
```json
{
  "initialCards": [
    {
      "id": 17,
      "name": "Sudden allergy attack during class",
      "image_url": "http://localhost:3001/assets/card17.png",
      "misfortune_index": 33,
      "theme": "university life"
    },
    {
      "id": 44,
      "name": "Ticket to graduation ceremony goes missing",
      "image_url": "http://localhost:3001/assets/card44.png",
      "misfortune_index": 87,
      "theme": "university life"
    },
    {
      "id": 47,
      "name": "Get lost on your first day of classes",
      "image_url": "http://localhost:3001/assets/card47.png",
      "misfortune_index": 93,
      "theme": "university life"
    }
  ],
  "guessCard": {
    "id": 7,
    "name": "Study group doesn’t show up",
    "image_url": "http://localhost:3001/assets/card7.png"
  }
}
``` 

- **POST `/api/cards/demo/guess`**
  - Submit a guess for the demo game (no DB update)
  - Request body: 
```json
{
  "initialCards": [
    { "id": 40, "misfortune_index": 12.3 },
    { "id": 27, "misfortune_index": 25.7 },
    { "id": 34, "misfortune_index": 42.0 }

  ],
  "guessCardId": 30,
  "position": 1,
  "timeout": true
}
``` 
  - Response: 
```json
{
  "isCorrect": false,
  "correctPos": 1,
  "timeout": true
}
``` 
or error

---

## Database Tables

- **Table `users`**: Stores user authentication and account information
  - `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
  - `username` (TEXT, UNIQUE, NOT NULL)
  - `password_hash` (TEXT, NOT NULL)
  - `salt` (TEXT, NOT NULL)
  - `created_at` (DATETIME, default now)

- **Table `cards`**: Contains all possible misfortune cards available in the game
  - `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
  - `name` (TEXT, NOT NULL)
  - `image_url` (TEXT, NOT NULL)
  - `misfortune_index` (REAL, UNIQUE, NOT NULL)
  - `theme` (TEXT, NOT NULL)

- **Table `games`**: Tracks individual game sessions and their overall status
  - `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
  - `user_id` (INTEGER, FK to users)
  - `status` (TEXT: 'completed' or 'ongoing')
  - `outcome` (TEXT: 'won', 'lost', or NULL)
  - `total_cards` (INTEGER)
  - `created_at` (DATETIME, default now)

- **Table `game_cards`**: Associates cards with games and tracks their state within each game
  - `game_id` (INTEGER, FK to games)
  - `card_id` (INTEGER, FK to cards)
  - `round_number` (INTEGER)
  - `won` (BOOLEAN)
  - `initial_card` (BOOLEAN)
  - **PRIMARY KEY:** (`game_id`, `card_id`) 
---

## 🏗️ Architecture Overview

### Component Structure
```
├── 📱 Frontend (React)
│   ├── 🧭 Navigation (NavbarComponent)
│   ├── 🏠 Pages (Home, Game, Profile, etc.)
│   ├── 🧩 Components (Cards, Timer, Buttons)
│   ├── 🌐 Contexts (Auth, Game State)
│   └── 📡 API Layer
│
├── 🔧 Backend (Express)
│   ├── 🛣️ Routes (Auth, Games, Cards)
│   ├── 🎮 Controllers (Business Logic)
│   ├── 💾 DAO (Database Access)
│   └── 🗄️ Database (SQLite)
│
└── 🎨 Static Assets (Card Images)
```

### Key Components

#### 🎮 Game Components
- **GamePage**: Main gameplay interface with timer and card interactions
- **MisfortuneCard**: Reusable card display component
- **GameTimer**: Real-time countdown with visual feedback
- **PositionButtons**: Interactive position selection interface

#### 📊 Data Components  
- **ProfilePage**: Game history with detailed statistics
- **ResultPage**: Game outcome summary and progression tracking

#### 🔐 Auth Components
- **LoginPage**: Secure authentication with validation
- **NavbarComponent**: Context-aware navigation with logout protection

#### 🌐 State Management
- **AuthContext**: User authentication state across the app
- **GameContext**: Centralized game state with timer management


## 🎯 Game Features & Logic

### 🎲 Card Selection Algorithm
- **Random Shuffling**: Fisher-Yates algorithm ensures fair card distribution
- **Unique Selection**: Each card appears maximum once per game session
- **Smart Filtering**: System excludes already-played cards from selection pool
- **Balanced Difficulty**: Progressive challenge as collection grows

### ⏱️ Timer Management
- **Client-Side Timing**: Smooth 30-second countdown using requestAnimationFrame
- **Server Validation**: Backend validates timeout status for security
- **Visual Feedback**: Progressive color changes and warnings
- **Automatic Submission**: Timeout triggers automatic incorrect guess

### 🎮 Game State Persistence
- **Session Continuity**: Resume interrupted games across browser sessions
- **Real-time Updates**: Immediate state synchronization between client and server
- **History Tracking**: Comprehensive game statistics and performance metrics
- **Error Recovery**: Robust error handling with graceful degradation

## 🧪 Demo Accounts

For testing purposes, use these pre-configured accounts:
- **Username**: `student1` | **Password**: `password1`
- **Username**: `student2` | **Password**: `password2`

Or try the **Demo Mode** for immediate gameplay without registration.

## 🤝 Contributing

This project demonstrates modern full-stack web development practices including:
- Component-based React architecture
- RESTful API design
- Secure authentication implementation
- Real-time user interactions
- Responsive design principles
- Database design and optimization

## 📄 License

This project is developed for educational purposes as part of a web application development course.
