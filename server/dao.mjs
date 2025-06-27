import sqlite3 from 'sqlite3';
import dayjs from 'dayjs';
import { User, Card, Game, GameCard } from './models.mjs';

// Apertura del database
const db = new sqlite3.Database('db/database.sqlite', (err) => {
  if (err) throw err;
});

// ================== USERS ==================

export const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) reject(err);
      else resolve(row ? User(row) : undefined);
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row ? User(row) : undefined);
    });
  });
};

// ================== CARDS ==================

export const getAllCards = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM cards';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => Card(row)));
    });
  });
};

export const getCardById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM cards WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row ? Card(row) : undefined);
    });
  });
};

// ================== GAMES ==================

export const createGame = ({ user_id, status, outcome, total_cards, started_at }) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO games (user_id, status, outcome, total_cards, created_at) VALUES (?, ?, ?, ?, ?)';
    const formattedDate = started_at ? dayjs(started_at).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');
    db.run(sql, [user_id, status, outcome, total_cards, formattedDate], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

export const getGameById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM games WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row ? Game(row) : undefined);
    });
  });
};


export const getCurrentGameByUser = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        g.*,
        gc.card_id,
        gc.round_number,
        gc.won,
        gc.initial_card,
        c.name,
        c.image_url,
        c.misfortune_index,
        c.theme
      FROM games g
      LEFT JOIN game_cards gc ON g.id = gc.game_id
      LEFT JOIN cards c ON gc.card_id = c.id
      WHERE g.user_id = ? 
      AND g.status = 'ongoing' 
      ORDER BY g.created_at DESC, gc.round_number ASC
      LIMIT 50`; 

    db.all(sql, [user_id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (!rows || rows.length === 0) {
        resolve(undefined);
        return;
      }

      // Il primo record contiene le informazioni del gioco
      const game = Game({
        id: rows[0].id,
        user_id: rows[0].user_id,
        status: rows[0].status,
        outcome: rows[0].outcome,
        total_cards: rows[0].total_cards,
        created_at: rows[0].created_at
      });

      const cards = rows
        .filter(row => row.card_id) // Filtra solo le righe con carte
        .map(row => ({
          id: row.card_id,
          name: row.name,
          image_url: row.image_url,
          misfortune_index: row.misfortune_index,
          theme: row.theme,
          won: Boolean(row.won),
          round_number: row.round_number,
          initial_card: Boolean(row.initial_card)
        }));

      resolve({
        game: game,
        cards: cards
      });
    });
  });
};

export const getGamesByUser = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC";
    db.all(sql, [user_id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => Game(row)));
    });
  });
};

export const updateGameStatus = (id, status, outcome) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE games SET status = ?, outcome = ? WHERE id = ?';
    db.run(sql, [status, outcome, id], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

// ================== GAME_CARDS ==================

export const addGameCard = ({ game_id, card_id, round_number, won, initial_card }) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO game_cards (game_id, card_id, round_number, won, initial_card) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [game_id, card_id, round_number, won ? 1 : 0, initial_card ? 1 : 0], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const getGameCards = (game_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM game_cards WHERE game_id = ? ORDER BY round_number ASC';
    db.all(sql, [game_id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => GameCard(row)));
    });
  });
};
