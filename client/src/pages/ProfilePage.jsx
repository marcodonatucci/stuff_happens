import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { GameContext } from '../contexts/GameContext.jsx';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';

function ProfilePage() {
    const { user } = useContext(AuthContext);
    const { history, loadHistory } = useContext(GameContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            loadHistory();
        }
    }, [user, loadHistory]);

    if (!user) {
        return (
            <>
                <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <h2 style={{ color: "#FFD600" }}>Please log in to view your profile.</h2>
                    <Button variant="warning" className="mt-3 fw-bold" style={{ color: "#000" }} onClick={() => navigate('/login')}>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Go to Login
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <Container className="py-4">
                <Row className="justify-content-center mb-4">
                    <Col md={8} className="text-center">
                        <h1 style={{ color: "#FFD600" }}>Profile</h1>
                        <h3 style={{ color: "#FFD600" }}>Username: {user.username}</h3>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col md={10}>
                        <h4 className="mb-3" style={{ color: "#FFD600" }}>Game History</h4>
                        {history.length === 0 && (
                            <p style={{ color: "#FFD600" }}>No completed games yet.</p>
                        )}
                        {history.map((entry, idx) => (
                            <Card className="mb-4" key={idx} bg="dark" text="light">
                                <Card.Body>
                                    <Card.Title>
                                        <span style={{ color: "#FFD600" }}>
                                            Game #{entry.game.id} - {entry.game.outcome === 'won' ? (
                                                <Badge bg="success">WON</Badge>
                                            ) : (
                                                <Badge bg="danger">LOST</Badge>
                                            )} 
                                        </span>
                                        <span className="ms-3 text-secondary" style={{ fontSize: "0.9rem" }}>
                                            {new Date(entry.game.started_at).toLocaleString()}
                                        </span>
                                    </Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        Total cards collected: <b>{entry.cards.filter(c => c.won).length}</b>
                                    </Card.Subtitle>
                                    <div>
                                        <table className="table table-dark table-bordered align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Card Name</th>
                                                    <th>Initial</th>
                                                    <th>Round</th>
                                                    <th>Won</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entry.cards.map((c, i) => (
                                                    <tr key={i}>
                                                        <td>{c.name}</td>
                                                        <td>
                                                            {c.initial_card ? (
                                                                <Badge bg="info">Initial</Badge>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td>
                                                            {c.initial_card ? (
                                                                "-"
                                                            ) : (
                                                                c.round_number
                                                            )}
                                                        </td>
                                                        <td>
                                                            {c.won ? (
                                                                <Badge bg="success">Yes</Badge>
                                                            ) : (
                                                                <Badge bg="danger">No</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default ProfilePage;
