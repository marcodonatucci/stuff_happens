const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database("db/database.sqlite");

db.serialize(() => {
  // USERS
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // CARDS
  db.run(`
    CREATE TABLE cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      misfortune_index REAL NOT NULL UNIQUE,
      theme TEXT NOT NULL
    )
  `);

  // GAMES
  db.run(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      status TEXT CHECK(status IN ('completed', 'ongoing')) NOT NULL,
      outcome TEXT CHECK(outcome IN ('won', 'lost')) DEFAULT NULL,
      total_cards INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // GAME_CARDS
  db.run(`
    CREATE TABLE game_cards (
      game_id INTEGER NOT NULL,
      card_id INTEGER NOT NULL,
      round_number INTEGER,
      won BOOLEAN,
      initial_card BOOLEAN NOT NULL,
      PRIMARY KEY (game_id, card_id),
      FOREIGN KEY(game_id) REFERENCES games(id),
      FOREIGN KEY(card_id) REFERENCES cards(id)
    )
  `);

  console.log('Database creato con successo: database.sqlite');
});


// --- INSERIMENTO DATI DI ESEMPIO ---

db.serialize(() => {

  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt('password1', salt, 32, (err, hashedPassword) => {
  const hash = hashedPassword.toString('hex');
  });
  const salt1 = crypto.randomBytes(16).toString('hex');
  const hash1 = crypto.scryptSync('password1', salt1, 32).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');
  const hash2 = crypto.scryptSync('password2', salt2, 32).toString('hex');

  db.run(`
    INSERT INTO users (username, password_hash, salt)
    VALUES 
    ('student1', '${hash1}', '${salt1}'),
    ('student2', '${hash2}', '${salt2}')
  `);

  const cards = [
  ["Exam postponed at the last minute", "http://localhost:3001/assets/card1.png", 1, "university life"],
  ["Professor absent on exam day", "http://localhost:3001/assets/card2.png", 3, "university life"],
  ["Lose your university ID badge", "http://localhost:3001/assets/card3.png", 5, "university life"],
  ["Coffee spilled on your notes", "http://localhost:3001/assets/card4.png", 7, "university life"],
  ["Library crowded during exam period", "http://localhost:3001/assets/card5.png", 9, "university life"],
  ["Computer breaks before project submission", "http://localhost:3001/assets/card6.png", 11, "university life"],
  ["Study group doesn’t show up", "http://localhost:3001/assets/card7.png", 13, "university life"],
  ["Lose USB stick with project files", "http://localhost:3001/assets/card8.png", 15, "university life"],
  ["Go to the wrong exam room", "http://localhost:3001/assets/card9.png", 17, "university life"],
  ["Forget to register for the exam", "http://localhost:3001/assets/card10.png", 19, "university life"],
  ["Power outage during online exam", "http://localhost:3001/assets/card11.png", 21, "university life"],
  ["Printer runs out of ink", "http://localhost:3001/assets/card12.png", 23, "university life"],
  ["Lose your wallet at the cafeteria", "http://localhost:3001/assets/card13.png", 25, "university life"],
  ["Wake up late on exam day", "http://localhost:3001/assets/card14.png", 27, "university life"],
  ["Surprise question during oral exam", "http://localhost:3001/assets/card15.png", 29, "university life"],
  ["Roommate makes noise all night", "http://localhost:3001/assets/card16.png", 31, "university life"],
  ["Sudden allergy attack during class", "http://localhost:3001/assets/card17.png", 33, "university life"],
  ["Walk into class with toilet paper stuck to your shoe", "http://localhost:3001/assets/card18.png", 35, "university life"],
  ["Accidentally reply-all to an email criticizing the professor", "http://localhost:3001/assets/card19.png", 37, "university life"],
  ["Forget the date of your thesis submission", "http://localhost:3001/assets/card20.png", 39, "university life"],
  ["Get ghosted by your thesis advisor", "http://localhost:3001/assets/card21.png", 41, "university life"],
  ["Caught plagiarizing unintentionally", "http://localhost:3001/assets/card22.png", 43, "university life"],
  ["Birthday party scheduled the night before your exam", "http://localhost:3001/assets/card23.png", 45, "university life"],
  ["Accidentally present the wrong file in class", "http://localhost:3001/assets/card24.png", 47, "university life"],
  ["Lecture cancelled after traveling across town", "http://localhost:3001/assets/card25.png", 49, "university life"],
  ["Forget the professor’s name during oral exam", "http://localhost:3001/assets/card26.png", 51, "university life"],
  ["Argument with roommate before group project presentation", "http://localhost:3001/assets/card27.png", 53, "university life"],
  ["Mic stays unmuted while complaining during online lecture", "http://localhost:3001/assets/card28.png", 55, "university life"],
  ["Caught sleeping in the front row", "http://localhost:3001/assets/card29.png", 57, "university life"],
  ["Embarrassing background during a class video call", "http://localhost:3001/assets/card30.png", 59, "university life"],
  ["Present wrong slide deck to an external evaluator", "http://localhost:3001/assets/card31.png", 61, "university life"],
  ["Photos of a university party go viral", "http://localhost:3001/assets/card32.png", 63, "university life"],
  ["Submit assignment a minute after the deadline", "http://localhost:3001/assets/card33.png", 65, "university life"],
  ["Forget to attend your internship meeting", "http://localhost:3001/assets/card34.png", 67, "university life"],

  ["Miss the bus on the day of your midterm", "http://localhost:3001/assets/card35.png", 69, "university life"],
  ["Lose your backpack with all your notes", "http://localhost:3001/assets/card36.png", 71, "university life"],
  ["Assigned to a dorm with no Wi-Fi", "http://localhost:3001/assets/card37.png", 73, "university life"],
  ["University cafeteria strike", "http://localhost:3001/assets/card38.png", 75, "university life"],
  ["Laptop stolen from library", "http://localhost:3001/assets/card39.png", 77, "university life"],
  ["Wi-Fi goes down during thesis submission", "http://localhost:3001/assets/card40.png", 79, "university life"],
  ["Campus floods the week of exams", "http://localhost:3001/assets/card41.png", 81, "university life"],
  ["Food poisoning from dorm dinner", "http://localhost:3001/assets/card42.png", 83, "university life"],
  ["Lose the only printed copy of your thesis", "http://localhost:3001/assets/card43.png", 85, "university life"],
  ["Ticket to graduation ceremony goes missing", "http://localhost:3001/assets/card44.png", 87, "university life"],
  ["Accident during campus sports event", "http://localhost:3001/assets/card45.png", 89, "university life"],
  ["Bike breaks down on the way to class", "http://localhost:3001/assets/card46.png", 91, "university life"],
  ["Get lost on your first day of classes", "http://localhost:3001/assets/card47.png", 93, "university life"],
  ["Bag stolen from the university library", "http://localhost:3001/assets/card48.png", 95, "university life"],
  ["Pay wrong tuition fee by mistake", "http://localhost:3001/assets/card49.png", 97, "university life"],
  ["Registration for mandatory course not accepted", "http://localhost:3001/assets/card50.png", 100, "university life"]
];



  const stmt = db.prepare("INSERT INTO cards (name, image_url, misfortune_index, theme) VALUES (?, ?, ?, ?)");
  for (const card of cards) {
    stmt.run(card);
  }
  stmt.finalize();

  db.run(`
    INSERT INTO games (user_id, status, outcome, total_cards)
    VALUES (1, 'completed', 'won', 3), (1, 'completed', 'won', 5)
  `);

  db.run(`
    INSERT INTO game_cards (game_id, card_id, round_number, won, initial_card)
    VALUES 
      (1, 1, 1, 1, 1),
      (1, 2, 2, 1, 0),
      (1, 3, 3, 1, 0)
  `);

  console.log('Dati di esempio inseriti con successo.');
});

db.close();

