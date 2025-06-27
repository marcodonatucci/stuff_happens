import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../contexts/GameContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import MisfortuneCard from '../components/MisfortuneCard';
import PositionButtons from '../components/PositionButton';
import GameTimer from '../components/GameTimer';
import { Container, Row, Col, Button, Card, Alert, Form, ProgressBar } from 'react-bootstrap';

function GamePage() {
    const { user } = useContext(AuthContext);
    const {
        currentGame,
        cards,
        currentRoundCard,
        getNextRoundCard,
        submitGuess,
        stopTimer,
        startTimer,
        timer,
        cardsWon,      
        mistakesCount,  
        isDemo  
    } = useContext(GameContext);

    const navigate = useNavigate(); 
    const [guessPosition, setGuessPosition] = useState(null);
    const [error, setError] = useState(null);
    const [roundResult, setRoundResult] = useState(null);
    const [waitingNext, setWaitingNext] = useState(false);
    const timerExpiredRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    // Computed values
    const sortedCards = React.useMemo(() => 
        [...(cards || [])].sort((a, b) => 
            (a?.misfortune_index || 0) - (b?.misfortune_index || 0)
        ),
        [cards]
    );

    const isGameOver = React.useMemo(() => 
        cardsWon >= 6 || mistakesCount >= 3,
        [cardsWon, mistakesCount]
    );

    // Definisco handleTimeout prima degli useEffect che lo usano
    const handleTimeout = useCallback(async () => {
        try {
            stopTimer();

            const result = await submitGuess({
                gameId: currentGame.game.id,
                guessCardId: currentRoundCard.id,
                position: 0,
                timeout: true
            });
            
            setRoundResult({ 
                ...result, 
                isCorrect: false, 
                timeout: true 
            });
            setWaitingNext(true);
            
            if (result.status === 'completed') {
                setTimeout(() => navigate('/result'), 2000);
            } 
            
            // Se il gioco non è finito, mostra il bottone Next Round
            // Il prossimo round verrà gestito da handleNextRound quando l'utente clicca il bottone
            timerExpiredRef.current = false;  // Resetta il flag del timeout
            
        } catch (err) {
            setError('Round failed due to timeout');
        }
    }, [stopTimer, submitGuess, currentGame, currentRoundCard, navigate]);

    // Effect di inizializzazione
    useEffect(() => {
    const initializeGame = async () => {

        if (!user && !isDemo) {
                navigate('/login');
                return;
        }
        
        try {
            setIsLoading(true);

            // Ottieni la prima carta solo se non è demo e non c'è già una carta
            if (!currentRoundCard && !isDemo) {
                await getNextRoundCard();
            }
        } catch (err) {
            setError("Error starting game");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    initializeGame();
}, [user, navigate, currentRoundCard, isDemo, getNextRoundCard]);

// Timer management
useEffect(() => {
    if (currentRoundCard && !waitingNext && !isGameOver) {
        startTimer();
        return () => stopTimer();
    }
}, [currentRoundCard, waitingNext, isGameOver, startTimer, stopTimer]);

// Effetto del timeout
useEffect(() => {
    if (timer === 0 && !waitingNext && !timerExpiredRef.current && currentRoundCard) {
        timerExpiredRef.current = true;
        handleTimeout();
    }
}, [timer, waitingNext, currentRoundCard, handleTimeout]); 

useEffect(() => {
    if (isDemo && waitingNext) {
        // Reindirizza alla pagina dei risultati dopo 2 secondi
        const timer = setTimeout(() => {
            navigate('/result');
        }, 2000);
        
        return () => clearTimeout(timer);
    }
}, [isDemo, waitingNext, navigate]);

const handleGuess = async (e) => {
    e.preventDefault();
    if (guessPosition === null) {
        setError("Please select a position");
        return;
    }

    try {
        stopTimer();
        const result = await submitGuess({
            gameId: currentGame.game.id,
            guessCardId: currentRoundCard.id,
            position: guessPosition,
            timeout: false
        });

        // Aggiorna il risultato del round
        setRoundResult({
            ...result,
            isCorrect: result.isCorrect 
        });
        setWaitingNext(true);
        
        // Se il gioco è finito, vai ai risultati
        if (result.status === 'completed' || mistakes >= 3 || sortedCards.length >= 6) {
            setTimeout(() => navigate('/result'), 2000);
        }
    } catch (err) {
        setError(err.message || "Error submitting guess");
    }
};

const handleNextRound = async () => {
    try {
        // Reset di tutti gli stati necessari
        setGuessPosition(null);
        setRoundResult(null);
        setError(null);
        setWaitingNext(false);
        timerExpiredRef.current = false;
        
        // Ottiene la prossima carta
        await getNextRoundCard();
    } catch (err) {
        setError("Error starting next round");
    }
};


const renderCards = () => {
    if (!sortedCards || !sortedCards.length) return null;

    return sortedCards.map((card, idx) => {
        if (!card) return null;
        
        return (
            <Col key={idx}>
                <MisfortuneCard card={card} />
            </Col>
        );
    });
};
                



    // Se sta caricando, mostra un loader
    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <div className="text-center">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2" style={{ color: "#FFD600" }}>Loading game state...</p>
                </div>
            </Container>
        );
    }

    return (
    <Container className="py-4">
        {/* Game Stats */}
        <Row className="justify-content-center mb-4">
            <Col md={10} className="text-center">
                <h2 className="mb-4" style={{ color: "#FFD600" }}>
                    Order the situations from least to most unfortunate!
                </h2>
                <div className="d-flex justify-content-center gap-5 mb-3">
                    {isDemo ? (
                <div className="text-center">
                    <h4 style={{ color: "#FFD600" }}>Demo Game</h4>
                    <div className="d-flex align-items-center gap-2">
                        <span className="fs-5" style={{ color: "#FFD600" }}>
                            One chance to guess right!
                        </span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center">
                        <h4 style={{ color: "#FFD600" }}>Progress</h4>
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-card-list"></i>
                            <span className="fs-5" style={{ color: "#FFD600" }}>
                                {cardsWon}/6 Cards
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <h4 style={{ color: "#FFD600" }}>Lives</h4>
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-heart-fill text-danger"></i>
                            <span className="fs-5" style={{ color: "#FFD600" }}>
                                {3 - mistakesCount} Remaining
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
            </Col>
        </Row>


        {/* Player's Cards */}
        <Row className="justify-content-center mb-4">
            <Col md={10}>
                <h5 style={{ color: "#FFD600" }}>Your Cards:</h5>
                <Row xs={1} md={2} lg={3} className="g-3">
                    {renderCards()}
                </Row>
            </Col>
        </Row>

        {/* Current Round */}
        {currentRoundCard && !waitingNext && (
            <Row className="justify-content-center mt-4">
                <Col md={8} className="text-center">
                    <h4 style={{ color: "#FFD600" }}>New Situation</h4>
                    
                    {/* Current Card */}
                   <div style={{ maxWidth: "350px" }} className="mx-auto mb-5">
                <MisfortuneCard 
                    card={currentRoundCard}
                    showIndex={false}
                />
            </div>

                    {/* Timer */}
                    <div className="mb-4">
                        <GameTimer currentTime={timer} />
                    </div>

                    {/* Position Selection */}
                    <Form onSubmit={handleGuess}>
    <Form.Group className="mb-3">
        <Form.Label id="position-label" style={{ color: "#FFD600" }}>
            Choose where this situation fits:
        </Form.Label>
        <PositionButtons
            sortedCards={sortedCards}
            selectedPosition={guessPosition}
            onPositionSelect={setGuessPosition}
        />
    </Form.Group>
    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    
    <Button 
        variant="warning" 
        type="submit" 
        className="mt-3 fw-bold"
        disabled={guessPosition === null}
    >
        Submit Guess
    </Button>
</Form>
                </Col>
            </Row>
        )}

        {/* Round Result */}
        {waitingNext && roundResult && (
    <Row className="justify-content-center mt-4">
        <Col md={8} className="text-center">
            {isDemo ? (
                // Solo messaggio demo
                <Alert variant={roundResult.isCorrect ? "success" : "danger"}>
                    {roundResult.isCorrect 
                        ? "Congratulations! You won the demo game!" 
                        : "You lost the demo game. Try again!"}
                    <br/>
                    Redirecting to results...
                </Alert>
            ) : (
                // Messaggio normale per partite non demo
                <Alert variant={roundResult.isCorrect ? "success" : "danger"}>
                    {roundResult.isCorrect && currentRoundCard
                        ? `Correct! The card's misfortune index was ${currentRoundCard.misfortune_index}`
                        : roundResult.timeout 
                            ? "Time's up! Round lost."
                            : roundResult.correctIndex !== undefined
                                ? `Wrong position! The card should go between ${roundResult.correctIndex} and ${roundResult.correctIndex + 1}`
                                : "Round lost!"
                    }
                </Alert>
            )}
            
            
            {/* Mostra Next Round solo se non è una demo e il gioco non è finito */}
            {!isDemo && !isGameOver && (
                <Button 
                    variant="warning" 
                    onClick={handleNextRound}
                    className="fw-bold"
                >
                    Next Round
                </Button>
            )}

            {/* Se è una demo, mostra un messaggio e reindirizza automaticamente */}
            {isDemo && (
                <Alert variant="info" className="mt-3">
                    Demo game completed! Redirecting to results...
                </Alert>
            )}
        </Col>
    </Row>
        )}
    </Container>
);
}
export default GamePage;