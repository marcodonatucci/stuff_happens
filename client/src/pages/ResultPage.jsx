import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../contexts/GameContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import MisfortuneCard from '../components/MisfortuneCard';
import { Container, Row, Col, Button, Card, Badge, Alert } from 'react-bootstrap';

function ResultPage() {
    const { user } = useContext(AuthContext);
    const { currentGame, startNewGame, isDemo, startDemo } = useContext(GameContext);
    const navigate = useNavigate();

    // Riorganizza le carte per tipo
    const initialCards = currentGame?.cards?.filter(c => c.initial_card) || [];
    const playedCards = currentGame?.cards?.filter(c => !c.initial_card) || [];

    const wonNonInitialCards = playedCards.filter(c => c.won).length;
    const isWinner = isDemo 
    ? playedCards.filter(c => c.won).length === 1
    : wonNonInitialCards >= 3;


    useEffect(() => {
        if (!user && !isDemo) {
            navigate('/login');
        }
    }, [user, isDemo, navigate]);



    const handleStartNew = async () => {
        try {
            if (isDemo) {
                await startDemo();
            } else {
                await startNewGame();
            }
            navigate('/game');
        } catch (err) {
            console.error('Error starting new game:', err);
        }
    };

    if (!currentGame) {
        return null;
    }

    // Carte vinte (incluse le iniziali)
    const wonCards = currentGame.cards
        ? currentGame.cards.filter(c => c.won)
        : [];

    return (
        <Container className="py-4">
            {/* Banner Risultato */}
            <Row className="justify-content-center mb-4">
                <Col md={8} className="text-center">
                    <h1 style={{ color: "#FFD600" }}>Game Results</h1>
                    <h4 style={{ color: "#FFD600" }}>
                         {isWinner ? (
                            <Badge bg="success" className="fs-5 px-4 py-2">YOU WON!</Badge>
                        ) : (
                            <Badge bg="danger" className="fs-5 px-4 py-2">YOU LOST</Badge>
                        )}
                    </h4>
                </Col>
            </Row>

            {/* Statistiche Partita */}
            <Row className="justify-content-center mb-5">
                <Col md={8} className="text-center">
                    <div className="d-flex justify-content-center gap-5">
                        <div>
                            <h5 style={{ color: "#FFD600" }}>Starting Cards</h5>
                            <span className="fs-4" style={{ color: "#FFD600" }}>{initialCards.length}</span>
                        </div>
                        <div>
                            <h5 style={{ color: "#FFD600" }}>Cards Won</h5>
                            <span className="fs-4" style={{ color: "#FFD600" }}>{playedCards.filter(c => c.won).length}</span>
                        </div>
                        <div>
                            <h5 style={{ color: "#FFD600" }}>Mistakes</h5>
                            <span className="fs-4" style={{ color: "#FFD600" }}>{playedCards.filter(c => !c.won).length}</span>
                        </div>
                    </div>

                {isDemo && (
            <Alert variant="info" className="mt-4">
                This was a demo game! <br/>
                Login to play the full game with multiple rounds and track your progress!
            </Alert>
        )}
                </Col>
            </Row>

            {/* Sezione Carte Iniziali */}
            <Row className="justify-content-center mb-5">
                <Col md={10}>
        <h3 style={{ color: "#FFD600" }} className="mb-3">Starting Cards</h3>
        <Row xs={1} md={2} lg={3} className="g-4">
            {initialCards.map((card, idx) => (
                <Col key={`initial-${idx}`}>
                    <MisfortuneCard 
                        card={card}
                        badge={{
                            bg: "warning",
                            text: "dark",
                            label: "Initial"
                        }}
                    />
                </Col>
            ))}
        </Row>
    </Col>
            </Row>

            {/* Sezione Carte Giocate */}
            <Row className="justify-content-center mb-5">
                 <Col md={10}>
        <h3 style={{ color: "#FFD600" }} className="mb-3">Played Cards</h3>
        <Row xs={1} md={2} lg={3} className="g-4">
            {playedCards.map((card, idx) => (
                <Col key={`played-${idx}`}>
                    <MisfortuneCard 
                        card={card}
                        badge={{
                            bg: card.won ? "success" : "danger",
                            label: card.won ? "Won" : "Lost"
                        }}
                        roundNumber={card.round_number + 1}
                    />
                </Col>
            ))}
        </Row>
    </Col>
            </Row>

            {/* Bottone Nuova Partita */}
            <Row className="justify-content-center mt-5">
                <Col md={8} className="text-center">
                    <Button
                        variant="warning"
                        size="lg"
                        className="fw-bold px-5"
                        style={{ color: "#000" }}
                        onClick={handleStartNew}
                    >
                        <i className="bi bi-arrow-repeat me-2"></i>
                        {isDemo ? "Start New Demo Game" : "Start New Game"}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default ResultPage;
