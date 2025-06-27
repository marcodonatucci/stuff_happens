import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { GameContext } from '../contexts/GameContext.jsx';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';

function HomePage() {
    const { user } = useContext(AuthContext);
    const { startNewGame, startDemo } = useContext(GameContext);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleStart = async () => {
        setError(null);
        try {
            if (user) {
                await startNewGame();
                navigate('/game');
            } else {
                await startDemo(); // uso startDemo per il gioco demo
                navigate('/game'); 
            }
        } catch (err) {
            setError(user ? 'Unable to start a new game.' : 'Unable to start demo game.');
        }
    };

    return (
        <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Row className="w-100 justify-content-center">
                <Col md={8} className="text-center">
                    <h1 style={{ color: "#FFD600" }}>Welcome to Stuff Happens!</h1>
                    <p style={{ color: "#FFD600" }}>
                        {user
                            ? `Hello, ${user.username}! Ready to test your luck?`
                            : "Welcome! Try the demo game or log in to play and save your progress."}
                    </p>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Button
                        variant="warning"
                        className="fw-bold"
                        style={{ color: "#000" }}
                        onClick={handleStart}
                    >
                        <i className="bi bi-play-circle me-2"></i>
                        {user ? "Start New Game" : "Try Demo Game"}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;
