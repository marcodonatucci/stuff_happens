import { Container, Row, Col, Card } from 'react-bootstrap';


function RulesPage() {
    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={10}>
                    <h1 className="text-center mb-4" style={{ color: "#FFD600" }}>How to Play Stuff Happens</h1>
                    
                    <Card bg="dark" text="light" className="mb-4">
                        <Card.Body>
                            <Card.Title style={{ color: "#FFD600" }}>Game Overview</Card.Title>
                            <Card.Text>
                                Stuff Happens is a game where you need to guess where horrible situations fit on your personal misfortune scale.
                                The higher the misfortune index, the worse the situation is!
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card bg="dark" text="light" className="mb-4">
                        <Card.Body>
                            <Card.Title style={{ color: "#FFD600" }}>Game Rules</Card.Title>
                            {/* Rimuovi Card.Text qui */}
                            <ol className="my-3">
                                <li className="mb-2">You start with 3 random cards showing horrible situations with their misfortune indices.</li>
                                <li className="mb-2">Each round, you'll see a new horrible situation (name and image only).</li>
                                <li className="mb-2">Your task: guess where this new situation fits among your current cards, based on its misfortune level.</li>
                                <li className="mb-2">You have 30 seconds to make your guess!</li>
                                <li className="mb-2">If you guess correctly, you win the card and it's added to your collection.</li>
                                <li className="mb-2">If you guess wrong or time runs out, you lose the round.</li>
                            </ol>
                        </Card.Body>
                    </Card>

                    <Card bg="dark" text="light" className="mb-4">
                        <Card.Body>
                            <Card.Title style={{ color: "#FFD600" }}>How to Win</Card.Title>
                            {/* Rimuovi Card.Text qui */}
                            <ul className="my-3">
                                <li className="mb-2">Collect 6 cards total to win the game!</li>
                                <li className="mb-2">Be careful: 3 wrong guesses and you lose the game.</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card bg="dark" text="light" className="mb-4">
                        <Card.Body>
                            <Card.Title style={{ color: "#FFD600" }}>Game Modes</Card.Title>
                            {/* Rimuovi Card.Text e usa div per i contenitori */}
                            <div className="my-3">
                                <h6 className="mb-2"><strong>Demo Mode (Not Logged In):</strong></h6>
                                <ul>
                                    <li>Play a single round to try the game</li>
                                    <li>Start with 3 cards and guess 1 situation</li>
                                    <li>No progress is saved</li>
                                </ul>

                                <h6 className="mt-4 mb-2"><strong>Full Game (Logged In):</strong></h6>
                                <ul>
                                    <li>Complete games with multiple rounds</li>
                                    <li>Track your progress and history</li>
                                    <li>View your game statistics in your profile</li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RulesPage;