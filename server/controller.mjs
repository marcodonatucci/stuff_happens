import * as dao from './dao.mjs';
import crypto from 'crypto';
import dayjs from 'dayjs';

// Utility per mischiare array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ================== AUTH ==================

export async function login(username, password) {
  const user = await dao.getUserByUsername(username);
  if (!user) return undefined;

  // verifica password
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, user.salt, 32, function (err, hashedPassword) {
      if (err) reject(err);
      // controllo se l'hash prodotto è uguale a quello salvato nel db
      if (!crypto.timingSafeEqual(Buffer.from(user.password_hash, 'hex'), hashedPassword))
        resolve(undefined);
      else
        resolve(user);
    });
  });
}

export async function getCurrentUser(userId) {
  if (!userId) return undefined;
  return await dao.getUserById(userId);
}

// ================== GAME ==================

// Avvia una nuova partita per utente autenticato
export async function startGame(userId) {
  // Prendi tutte le carte e mischiale
  const allCards = await dao.getAllCards();
  const cards = shuffle([...allCards]);
  // Prendi le prime 3 come carte iniziali
  const initialCards = cards.splice(0, 3);

  initialCards.sort((a, b) => a.misfortune_index - b.misfortune_index);

  const started_at = dayjs().format('YYYY-MM-DD HH:mm:ss');

  // Crea la partita
  const gameId = await dao.createGame({
    user_id: userId,
    status: 'ongoing',
    outcome: null,
    total_cards: 3,
    started_at: started_at
  });
  // Inserisci le carte iniziali nella tabella game_cards
  for (let i = 0; i < initialCards.length; i++) {
    await dao.addGameCard({
      game_id: gameId,
      card_id: initialCards[i].id,
      round_number: null,
      won: true,
      initial_card: true
    });
  }
  // Restituisci le carte iniziali e id partita
  return {
    gameId,
    initialCards,
    started_at
  };
}

// Avvia una partita demo (anonimo): restituisce solo le 3 carte iniziali e una carta da indovinare
export async function startDemoGame() {
  const allCards = await dao.getAllCards();
  const cards = shuffle([...allCards]);
  const initialCards = cards.splice(0, 3);
  initialCards.sort((a, b) => a.misfortune_index - b.misfortune_index);
  // Scegli una carta da indovinare che non sia tra le iniziali
  const guessCard = cards[0];
  return {
    initialCards,
    guessCard: { id: guessCard.id, name: guessCard.name, image_url: guessCard.image_url }
  };
}

// Restituisce la partita corrente dell'utente (con carte)
export async function getCurrentGame(userId) {
    try {
        const gameData = await dao.getCurrentGameByUser(userId);
        
        if (!gameData) {
            return undefined;
        }

        // gameData contiene già sia il game che le cards formattate correttamente
        return {
            game: gameData.game,
            cards: gameData.cards.map(card => ({
                id: card.id,
                name: card.name,
                image_url: card.image_url,
                misfortune_index: card.misfortune_index,
                theme: card.theme,
                won: card.won,
                round_number: card.round_number,
                initial_card: card.initial_card
            }))
        };
    } catch (err) {
        console.error('Error in getCurrentGame:', err);
        throw err;
    }
}

// Gestisce il guess di una carta (round di gioco)
export async function guessCard(userId, guess) {
  // guess: { gameId, guessCardId, position, timeout }
  const game = await dao.getGameById(guess.gameId);
  if (!game || game.user_id !== userId || game.status !== 'ongoing') return { error: 'Invalid game' };
  
  // Se è una chiamata di game over, aggiorna solo lo stato
    if (guess.isGameOver) {
        await dao.updateGameStatus(game.id, 'completed', guess.outcome);
        return {
            isCorrect: false,
            status: 'completed',
            outcome: guess.outcome
        };
    }
  // Prendi tutte le carte della partita (incluse le iniziali e quelle vinte)
  const gameCards = await dao.getGameCards(game.id);
  // Ordina per misfortune_index crescente
  const allCards = await dao.getAllCards();
  const ownedCards = gameCards
    .filter(gc => gc.won)
    .map(gc => allCards.find(c => c.id === gc.card_id))
    .sort((a, b) => a.misfortune_index - b.misfortune_index);

  // Trova la carta da indovinare
  const guessCard = allCards.find(c => c.id === guess.guessCardId);
  if (!guessCard) return { error: 'Card not found' };

  // Calcola la posizione corretta
  let correctPos = 0;
  while (
    correctPos < ownedCards.length &&
    ownedCards[correctPos].misfortune_index < guessCard.misfortune_index
  ) {
    correctPos++;
  }

  // Verifica se la posizione scelta è corretta
  // Se timeout è true, il round è perso a prescindere
  let isCorrect = false;
  if (!guess.timeout) {
    isCorrect = (guess.position === correctPos);
  }

  // Aggiorna la tabella game_cards
  await dao.addGameCard({
    game_id: game.id,
    card_id: guessCard.id,
    round_number: ownedCards.length - 2, // round parte da 1 dopo le 3 iniziali
    won: isCorrect,
    initial_card: false
  });

  // Aggiorna stato partita
   const wonCards = gameCards.filter(gc => gc.won && !gc.initial_card).length + (isCorrect ? 1 : 0);
    const lostCards = gameCards.filter(gc => !gc.won && !gc.initial_card).length + (isCorrect ? 0 : 1);

    let status = 'ongoing', outcome = null;
    
    if (wonCards >= 3) {  
        status = 'completed';
        outcome = 'won';
    } else if (lostCards >= 3) {
        status = 'completed';
        outcome = 'lost';
    }

  await dao.updateGameStatus(game.id, status, outcome);

  return {
    isCorrect,
    correctPos,
    guessCard: isCorrect ? guessCard : undefined,
    status,
    outcome,
    timeout: !!guess.timeout
  };
}

// Estrae una nuova carta da indovinare per la partita corrente (che non sia già stata giocata)
export async function getNextGuessCard(gameId) {
  const gameCards = await dao.getGameCards(gameId);
  const allCards = await dao.getAllCards();
  const usedIds = gameCards.map(gc => gc.card_id);
  const available = allCards.filter(c => !usedIds.includes(c.id));
  if (available.length === 0) return undefined;
  const card = shuffle(available)[0];
  return { id: card.id, name: card.name, image_url: card.image_url };
}

// Demo: verifica la posizione per una partita demo (non aggiorna DB)
export async function guessDemoCard(initialCards, guessCardId, position, timeout) {

  const allCards = await dao.getAllCards();
  const guessCard = allCards.find(c => c.id === guessCardId);
  if (!guessCard) return { error: 'Card not found' };

  // Ordina le carte iniziali per misfortune_index
  const ownedCards = initialCards
    .map(c => allCards.find(card => card.id === c.id))
    .sort((a, b) => a.misfortune_index - b.misfortune_index);

  // Calcola la posizione corretta
  let correctPos = 0;
  while (
    correctPos < ownedCards.length &&
    ownedCards[correctPos].misfortune_index < guessCard.misfortune_index
  ) {
    correctPos++;
  }

  // Se timeout è true, il round è perso a prescindere
  let isCorrect = false;
  if (!timeout) {
    isCorrect = (position === correctPos);
  }

  return {
    isCorrect,
    correctPos,
    guessCard: isCorrect ? guessCard : undefined,
    timeout: !!timeout
  };
}

// Ottiene la storia completa dei giochi di un utente con dettagli delle carte
export async function getGameHistory(userId) {
    try {
        // Ottieni tutti i giochi dell'utente
        const games = await dao.getGamesByUser(userId);
        
        // Per ogni gioco, ottieni le relative carte
        const fullHistory = await Promise.all(games.map(async (game) => {
            const gameCards = await dao.getGameCards(game.id);
            const allCards = await dao.getAllCards();
            
            // Mappa le carte del gioco con tutti i dettagli
            const cardsWithDetails = gameCards.map(gc => {
                const cardDetails = allCards.find(c => c.id === gc.card_id);
                return {
                    id: cardDetails.id,
                    name: cardDetails.name,
                    image_url: cardDetails.image_url,
                    misfortune_index: cardDetails.misfortune_index,
                    theme: cardDetails.theme,
                    won: gc.won,
                    round_number: gc.round_number,
                    initial_card: gc.initial_card
                };
            });

            // Ritorna il gioco con le sue carte
            return {
                game: {
                    id: game.id,
                    status: game.status,
                    outcome: game.outcome,
                    started_at: game.created_at
                },
                cards: cardsWithDetails.sort((a, b) => {
                    // Ordina prima per round_number, poi mette le carte iniziali all'inizio
                    if (a.initial_card && !b.initial_card) return -1;
                    if (!a.initial_card && b.initial_card) return 1;
                    return (a.round_number || 0) - (b.round_number || 0);
                })
            };
        }));

        // Ordina la storia per data di creazione decrescente
        return fullHistory.sort((a, b) => 
            new Date(b.game.started_at) - new Date(a.game.started_at)
        );

    } catch (err) {
        console.error('Error in getGameHistory:', err);
        throw err;
    }
}
