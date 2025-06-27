import React, { createContext, useState, useRef, useCallback } from 'react';
import { API } from '../api.mjs';

export const GameContext = createContext();

export function GameProvider({ children }) {
    // Stato base del gioco
    const [currentGame, setCurrentGame] = useState(null);
    const [isDemo, setIsDemo] = useState(false);
    const [cards, setCards] = useState([]);
    const [currentRoundCard, setCurrentRoundCard] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [outcome, setOutcome] = useState(null);

    // Timer
    const [timer, setTimer] = useState(30);
    const timerRef = useRef(null);

    // Contatori
    const [cardsWon, setCardsWon] = useState(0);
    const [mistakesCount, setMistakesCount] = useState(0);

    const [history, setHistory] = useState([]);

  // Funzione loadHistory
    const loadHistory = useCallback(async () => {
        try {
            const gameHistory = await API.getGameHistory();
            setHistory(gameHistory);
        } catch (err) {
            console.error('Error loading game history:', err);
            setHistory([]);
        }
    }, []);


// Funzione checkGameOver
const checkGameOver = useCallback(() => {
    if (!currentGame?.game) return false;
   
    if (cardsWon >= 6 || mistakesCount >= 3) {

      const finalOutcome = cardsWon >= 6 ? 'won' : 'lost';

        setGameOver(true);
         setOutcome(finalOutcome); 
        setCurrentGame(prev => ({
            ...prev,
            game: {
                ...prev.game,
                status: 'completed',
                outcome: finalOutcome
            }
        }));

        // Aggiorna il DB
        API.submitGuess({
            gameId: currentGame.game.id,
            guessCardId: null,
            position: null,
            timeout: false,
            isGameOver: true,
            outcome: finalOutcome
        }).catch(err => console.error('Error updating game status:', err));

        return true;
    }
    return false;
}, [cardsWon, mistakesCount, currentGame]);

    // Carica partita corrente
    const loadCurrentGame = useCallback(async () => {
        if (currentGame?.game && cards.length > 0) {
            return currentGame;
        }

        try {
            const game = await API.getCurrentGame();
            if (game) {
                setCurrentGame(game);
                setCards(game.cards || []);
                setGameOver(game.game?.status === 'completed');
                setOutcome(game.game?.outcome || null);
                
                // Se c'è una partita in corso, carica subito la prossima carta
            if (game.game?.status === 'ongoing') {
                const nextCard = await API.nextRound();
                setCurrentRoundCard(nextCard);
            }

            return game;
            } else {
                setCurrentGame(null);
                setCards([]);
                setGameOver(false);
                setOutcome(null);
                setCurrentRoundCard(null);
                return null;
            }
        } catch (err) {
            console.error('Error loading game:', err);
            return null;
        }
    }, [currentGame, cards]);

    // Inizia nuova partita
    const startNewGame = async () => {
        try {
            setIsDemo(false); // Reset isDemo
            const game = await API.startGame();
            setCurrentGame(game);
            setCards(game.cards || []);
            setCardsWon(3); // Partiamo con 3 carte iniziali
            setMistakesCount(0);
            setGameOver(false);
            setOutcome(null);
            setCurrentRoundCard(null);
            resetTimer();
            
            // Ottiene prima carta del round
            await getNextRoundCard();
            return game;
        } catch (err) {
            console.error('Error starting game:', err);
            throw err;
        }
    };

    // Gestione del guess
    const submitGuess = async ({ gameId, guessCardId, position, timeout }) => {
    if (!currentGame) throw new Error("No current game");
        // Aggiungere controllo se il gioco è già finito
    if (currentGame?.game?.status === 'completed') {
        throw new Error("Game is already completed");
    }
        try {
          let result;
            
            if (isDemo) {
                // Usa l'API demo per il guess
                result = await API.submitDemoGuess({
                    initialCards: cards,
                    guessCardId,
                    position,
                    timeout
                });

                // Aggiorna lo stato in base al risultato
                if (result.isCorrect) {
                    setCards(prev => [...prev, currentRoundCard]);
                    setCardsWon(prev => prev + 1);
                } else {
                    setMistakesCount(1);
                }

                // In demo, il gioco finisce dopo un round
                setGameOver(true);
                setOutcome(result.isCorrect ? 'won' : 'lost');
                setCurrentRoundCard(null);
                
                // Aggiorna lo stato finale del gioco demo
            setCurrentGame(prev => ({
                ...prev,
                game: {
                    ...prev.game,
                    status: 'completed',
                    outcome: result.isCorrect ? 'won' : 'lost'
                },
                cards: [...prev.cards, {
                    ...currentRoundCard,
                    won: result.isCorrect,
                    initial_card: false,
                    round_number: 0
                }]
            }));

            result.status = 'completed';
            result.outcome = result.isCorrect ? 'won' : 'lost';
            
            } else {
        result = await API.submitGuess({
            gameId,
            guessCardId,
            position: timeout ? 0 : position,
            timeout,
        });
          
        // Se è timeout o risposta sbagliata, incrementa i mistakes
        if (timeout || !result.isCorrect) {
            setMistakesCount(prev => prev + 1);
        }

         // Aggiorna contatori in base al risultato
            if (result.isCorrect) {
                setCardsWon(prev => prev + 1);
            } 

        // Aggiorna stato partita
        if (result.isCorrect && result.guessCard) {
            setCards(prev => [...prev, result.guessCard]
                .sort((a, b) => a.misfortune_index - b.misfortune_index));
            setCurrentGame(prev => ({
                    ...prev,
                    cards: [...prev.cards, {
                        ...result.guessCard,
                        won: true,
                        initial_card: false,
                        round_number: cards.length - 3 
                    }]
                }));
        } else {
                // Aggiunge anche le carte perse
                setCurrentGame(prev => ({
                    ...prev,
                    cards: [...prev.cards, {
                        ...currentRoundCard,
                        won: false,
                        initial_card: false,
                        round_number: cards.length - 3
                    }]
                }));
            }

        setCurrentRoundCard(null);
        resetTimer();

        // Verifica e gestisce il game over
        const isOver = checkGameOver();
        if (isOver) {
          const finalOutcome = cardsWon >= 6 ? 'won' : 'lost';
            setCurrentGame(prev => ({
                    ...prev,
                    game: {
                        ...prev.game,
                        status: 'completed',
                        outcome: finalOutcome
                    }
                }));
            result.status = 'completed';
            result.outcome = finalOutcome
        }
      }
        return result;
    } catch (err) {
        console.error('Error submitting guess:', err);
        throw err;
    }
};

    // Nuova carta per round successivo
    const getNextRoundCard = async () => {
        if (!currentGame) return null;
        try {

          // Se è una demo, non chiama il server
          if (isDemo) {
              return null; 
          }

            const card = await API.nextRound();
            setCurrentRoundCard(card);
            setTimer(30);
            resetTimer();
            return card;
        } catch (err) {
            console.error('Error getting next card:', err);
            throw err;
        }
    };

    // Gestione del timer
const startTimer = useCallback(() => {
    resetTimer();
    const startTime = Date.now();
    
    const updateTimer = () => {
        if (timerRef.current) {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const newTime = Math.max(30 - elapsedSeconds, 0);
            setTimer(newTime);
            
            if (newTime > 0) {
                timerRef.current = requestAnimationFrame(updateTimer);
            }
        }
    };
    
    timerRef.current = requestAnimationFrame(updateTimer);
}, []);

const stopTimer = useCallback(() => {
    if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
    }
}, []);

const resetTimer = useCallback(() => {
    stopTimer();
    setTimer(30);
}, [stopTimer]);

    // Funzione per iniziare una partita demo
    const startDemo = async () => {
        try {
            setIsDemo(true); // Set isDemo
            const demoData = await API.startDemo();
            
            // Imposta lo stato del gioco per la demo
            setCurrentGame({
                game: {
                    id: 'demo',
                    status: 'ongoing',
                    created_at: new Date().toISOString()
                },
                cards: demoData.initialCards.map(card => ({
                    ...card,
                    won: true,
                    initial_card: true
                }))
            });
            
            setCards(demoData.initialCards);
            setCurrentRoundCard(demoData.guessCard);
            setCardsWon(3);
            setMistakesCount(0);
            setGameOver(false);
            setOutcome(null);
            resetTimer();
            return demoData;
        } catch (err) {
            console.error('Error starting demo:', err);
            throw err;
        }
    };

    // Cleanup timer 
    React.useEffect(() => {
        return () => stopTimer();
    }, []);

    return (
        <GameContext.Provider value={{
            // Game state
            currentGame,
            cards,
            currentRoundCard,
            gameOver,
            outcome,
            timer,
             cardsWon,        
            mistakesCount,
            history,
            loadHistory,     

            // Game functions
            loadCurrentGame,
            startNewGame,
            submitGuess,
            getNextRoundCard,

            // Timer functions
            startTimer,
            stopTimer,
            resetTimer,

            isDemo,
            startDemo,
        }}>
            {children}
        </GameContext.Provider>
    );
}